'use client'

import { useEffect, useState } from "react";
import { getStoredUserToken, googleSignIn } from "@/utils/AuthUtil";
import { AuthAPI } from "@/api/AuthAPI";
import { TomeAPI } from "@/api/TomeAPI";
import { TopicReview } from "@/model/topicReview";
import TopicMemLevels from "./ui/cards/TopicMemLevels";
import OverallMemLevel from "./ui/cards/OveralMemLevel";
import RunningTopicReviewCard from "./ui/cards/RunningTopicReviewCard";
import NewTopicReviewCard from "./ui/cards/NewTopicReviewCard";
import { TopicReviewQuestion } from "@/model/questions";

export default function Home() {

  const [loginNeeded, setLoginNeeded] = useState<boolean | null>(null)
  const [runningTopicReview, setRunningTopicReview] = useState<TopicReview | undefined>(undefined)
  const [runningTRQuestions, setRunningTRQuestions] = useState<TopicReviewQuestion[] | undefined>(undefined)

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
    setRunningTRQuestions(response.questions);


  }

  useEffect(() => { verifyAuthentication() }, [])
  useEffect(() => { triggerSignIn() }, [loginNeeded])
  useEffect(() => { loadRunningTopicReview() }, [loginNeeded])

  // Empty screen while Google SignIn is loading
  if (loginNeeded == null) return (<div></div>)
  if (loginNeeded === true) return (<div></div>)

  return (
    <div>

      <div className="app-content px-8">
        <div className="flex flex-1 flex-col items-stretch justify-start">

          <div className="flex flex-col xl:flex-row xl:justify-center xl:space-x-16">
            <div className="mt-4 mb-4"><OverallMemLevel /></div>
            {runningTopicReview && <RunningTopicReviewCard topicReview={runningTopicReview} questions={runningTRQuestions} />}
            {!runningTopicReview && <NewTopicReviewCard />}
          </div>

          <div className="bg-[#00b9cf] py-4 rounded-md mt-8">
            <TopicMemLevels />
          </div>
        </div>

      </div>
    </div>
  );
}
