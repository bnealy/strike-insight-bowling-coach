
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle } from "lucide-react";

interface SaveGameAlertProps {
  showSuccess: boolean;
  errorMessage: string | null;
}

const SaveGameAlert: React.FC<SaveGameAlertProps> = ({ showSuccess, errorMessage }) => {
  if (!showSuccess && !errorMessage) return null;
  
  return (
    <>
      {showSuccess && (
        <Alert className="mb-5 bg-green-50 border-green-500">
          <CheckCircle className="h-5 w-5 text-green-500" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>
            Games saved successfully to your profile!
          </AlertDescription>
        </Alert>
      )}
      
      {errorMessage && (
        <Alert className="mb-5 bg-red-50 border-red-500">
          <XCircle className="h-5 w-5 text-red-500" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};

export default SaveGameAlert;
