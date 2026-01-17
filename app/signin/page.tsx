"use client";

import { SignIn } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        

        {/* Sign In Container */}
        <div className="flex min-h-[calc(100vh-160px)] items-center justify-center">
          <Card className="w-full max-w-md p-8 shadow-xl rounded-2xl border-0 bg-white">
            <div className="space-y-6">
              <SignIn/>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600">
          <p>© {new Date().getFullYear()} Agroflow. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}