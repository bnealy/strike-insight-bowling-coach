
import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from '@/contexts/AuthContext';

interface SignInRequiredDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSignIn: () => void;
}

const SignInRequiredDialog: React.FC<SignInRequiredDialogProps> = ({ 
  isOpen, 
  onClose,
  onSignIn
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Sign In Required</AlertDialogTitle>
          <AlertDialogDescription>
            You need to sign in to save your bowling games. Sign in or create an account to save your progress and access your game history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onSignIn}>Sign In</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default SignInRequiredDialog;
