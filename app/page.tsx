'use client'

import PowerCard from "./ui/cards/PowerCard";
import RoundButton from "./ui/buttons/RoundButton";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredUserToken, googleSignIn } from "@/utils/AuthUtil";
import { AuthAPI } from "@/api/AuthAPI";
import TopicsCard from "./ui/cards/TopicsCard";
import Book from "./ui/graphics/icons/Book";
import { TomeAPI } from "@/api/TomeAPI";
import { TopicReview } from "@/model/topicReview";
import NextSVG from "./ui/graphics/icons/Next";
import Footer from "./ui/layout/Footer";

export default function Home() {

  const [loginNeeded, setLoginNeeded] = useState<boolean | null>(null)
  const [runningTopicReview, setRunningTopicReview] = useState<TopicReview | undefined>(undefined)

  const router = useRouter()

  /**
   * Verifies if the user is authenticated
   */
  const verifyAuthentication = async () => {

    // Get the user from local storage
    const user = getStoredUserToken()

    // Login is needed if the user is not in local storage
    if (!user) {

      console.log("No user or Id Token found. Login needed.");

      setLoginNeeded(true)

      return;

    }

    // The user is stored in local storage
    // Verify its token
    console.log("Verifying Id Token");
    const verificationResult = await new AuthAPI().verifyToken(user.idToken)

    // Check that the token hasn't expired
    if (verificationResult.name == "TokenExpiredError") {

      console.log("JWT Token Expired");

      // If the token has expired, you need to login
      setLoginNeeded(true);

      return;

    }

    setLoginNeeded(false);

    console.log("Token successfully verified.");

  }

  /**
   * Triggers the Google SignIn process
   */
  const triggerSignIn = async () => {

    if (loginNeeded === true) {

      const authenticatedUser = await googleSignIn()

      if (authenticatedUser) setLoginNeeded(false)
    }

  }

  /**
   * Function that loads the Running Topic Review (if any) from the TomeAPI
   */
  const loadRunningTopicReview = async () => {

    const response = await new TomeAPI().getRunningTopicReview()

    setRunningTopicReview(response.topicReview);


  }

  useEffect(() => { verifyAuthentication() }, [])
  useEffect(() => { triggerSignIn() }, [loginNeeded])
  useEffect(() => { loadRunningTopicReview() }, [loginNeeded])

  // Empty screen while Google SignIn is loading
  if (loginNeeded == null) return (<div></div>)
  if (loginNeeded === true) return (<div></div>)

  return (
    <div className="flex flex-1 flex-col items-stretch justify-start space-y-4">
      <div className="flex flex-row space-x-4 items-center">
        {/* <div className="flex-1"><DailyProgress/></div> */}
        <div className="flex-1"><PowerCard perc={45} /></div>
      </div>
      <div className="">
        <TopicsCard />
      </div>
      {runningTopicReview &&
        <div className="flex flex-row items-center justify-center -mx-2 px-3 space-x-2">
          <div className="w-10 h-10 p-2 fill-cyan-200 border border-2 rounded border-cyan-200"><Book /></div>
          <div className="flex flex-col flex-1 md:flex-none">
            <div className="text-sm">You have a running Topic Review</div>
            <div className="text-lg">{runningTopicReview?.topicTitle}</div>
          </div>
          <div className="md:pl-8">
            <RoundButton icon={<NextSVG />} size="s" onClick={() => { router.push(`/tr/${runningTopicReview?.id}`) }} />
          </div>
        </div>
      }
      <div className="flex-1"></div>
      <Footer>
        <div className="flex justify-center">
          <RoundButton icon={<Book />} disabled={runningTopicReview != null} onClick={() => { router.push('/tr/new') }} />
        </div>
      </Footer>
    </div>
  );
}
