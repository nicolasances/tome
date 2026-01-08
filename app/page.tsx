'use client'

import { useEffect, useState } from "react";
import { getStoredUserToken, googleSignIn } from "@/utils/AuthUtil";
import { AuthAPI } from "@/api/AuthAPI";
import Header from "./ui/layout/Header";
import { WeekDailyGoals } from "@/components/WeekDailyGoals";
import { TopicsList } from "@/app/components/TopicsList";
import TomeHeader from "./components/TomeHeader";
import RoundButton from "./ui/buttons/RoundButton";
import { useCarMode } from "@/context/CarModeContext";

export default function Home() {

  const [loginNeeded, setLoginNeeded] = useState<boolean | null>(null)
  const {toggleCarMode, carMode} = useCarMode();

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
    <div className="py-4 px-1 h-full flex flex-col">

      <TomeHeader title="Tome" 
        rightButton={!carMode && (
          <RoundButton svgIconPath={{src: "/images/car.svg", alt: "Car Mode", color: carMode ? "bg-red-700" : "bg-cyan-800"}} onClick={toggleCarMode} slim={true} size='s' />
        )}
      />

      <TopicsList />

      <div className="flex-1"></div>

      <div className="mb-2">
        <WeekDailyGoals />
      </div>
    </div>
  );
}
