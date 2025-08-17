'use client'

import { useEffect, useState } from "react";
import { getStoredUserToken, googleSignIn } from "@/utils/AuthUtil";
import { AuthAPI } from "@/api/AuthAPI";
import RoundButton from "./ui/buttons/RoundButton";
import Add from "./ui/graphics/icons/Add";
import { useRouter } from "next/navigation";
import Header from "./ui/layout/Header";
import { TopicsAndPractices } from "@/components/TopicsAndPractices";
import { WeeklyPractices } from "@/components/WeeklyPractices";

export default function Home() {

  const [loginNeeded, setLoginNeeded] = useState<boolean | null>(null)
  const router = useRouter();

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

  useEffect(() => { verifyAuthentication() }, [])
  useEffect(() => { triggerSignIn() }, [loginNeeded])

  // Empty screen while Google SignIn is loading
  if (loginNeeded == null) return (<div></div>);
  if (loginNeeded === true) return (<div></div>);

  return (
    <div className="p-4 h-full flex flex-col">

      <Header />

      <TopicsAndPractices />

      <div className="flex justify-center items-center space-x-2 mt-4">
        <RoundButton icon={<Add />} onClick={() => { router.push(`/new-topic`) }} size="m" />
      </div>

      <div className="flex-1"></div>

      <div className="mb-2">
        <WeeklyPractices />
      </div>
    </div>
  );
}
