"use client";

// import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Button, Popup } from "pixel-retroui";
import { useState } from "react";

export function MobileFAB() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const openPopup = () => setIsPopupOpen(true);
  const closePopup = () => setIsPopupOpen(false);
  return (
    <>
      <Button
        onClick={openPopup}
        bg="green"
        textColor="white"
        className="fixed bottom-6 right-6 md:hidden z-40"
        aria-label="Agregar nuevo movimiento"
      >
        <Plus className="w-6 h-6" />
      </Button>

      <Popup isOpen={isPopupOpen} onClose={closePopup}>
        Pop up content
      </Popup>
    </>
  );
}
