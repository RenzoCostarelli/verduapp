"use client";

import { signOut } from "@/lib/auth-actions";
import { LogOut } from "lucide-react";
import { Button } from "pixel-retroui";

export default function NavBar() {
  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="fixed w-full bottom-6 left-6">
      <Button
        onClick={handleSignOut}
        bg="red"
        className="flex items-center gap-2"
      >
        <LogOut size={16} />
        Salir
      </Button>
    </div>
  );
}
