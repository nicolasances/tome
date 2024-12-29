'use client'

import Card from "./ui/cards/Card";
import TimeSpentCard from "./ui/cards/TimeSpentCard";
import PowerCard from "./ui/cards/PowerCard";
import RoundButton from "./ui/buttons/RoundButton";
import LightningBoltSVG from "./ui/buttons/assets/LightningBoltSVG";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getStoredUserToken, googleSignIn } from "@/utils/AuthUtil";
import { AuthAPI } from "@/api/AuthAPI";

export default function Home() {

  const [loginNeeded, setLoginNeeded] = useState<boolean | null>(null)

  const router = useRouter()

  console.log("NEXT_PUBLIC_AUTH_API_ENDPOINT: " + process.env.NEXT_PUBLIC_AUTH_API_ENDPOINT);
  

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
  if (loginNeeded == null) return (<div></div>)

  if (loginNeeded === true) return (<div></div>)

  return (
    <div className="flex flex-1 flex-col items-stretch justify-start space-y-2">
      <Card title="Topics" />
      <div className="flex flex-row flex-1 space-x-4">
        <TimeSpentCard perc={2}></TimeSpentCard>
        <PowerCard perc={45} />
      </div>
      <div className="flex-1"></div>
      <div className="flex justify-center">
        <RoundButton icon={<LightningBoltSVG />} onClick={() => { router.push('/quiz') }} />
      </div>
    </div>
  );
}
