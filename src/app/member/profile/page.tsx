"use client";

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link'; 
import { PageTitle } from '@/components/shared/page-title';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/auth-context';
import { getStudentByEmail, getStudentByCustomId } from '@/services/student-service'; 
import type { Student } from '@/types/student'; 
import { UserCircle, UploadCloud, Save, Mail, Phone, BookOpen, MapPin, Receipt, Loader2, Edit, SquareUser, IndianRupee } from 'lucide-react';

const DEFAULT_PROFILE_PLACEHOLDER = "https://placehold.co/200x200.png";
const ID_CARD_PLACEHOLDER = "https://placehold.co/300x200.png?text=ID+Card";

export default function MemberProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [memberDetails, setMemberDetails] = React.useState<Student | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSavingPicture, setIsSavingPicture] = React.useState(false);

  const [currentProfilePicture, setCurrentProfilePicture] = React.useState(DEFAULT_PROFILE_PLACEHOLDER);
  const [profilePicturePreview, setProfilePicturePreview] = React.useState<string | null>(null);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setIsLoading(true);
    const fetchStudent = async () => {
      try {
        let student = null;
        if (user?.studentId) {
          student = await getStudentByCustomId(user.studentId);
        } else if (user?.email) {
          student = await getStudentByEmail(user.email);
        }

        if (student) {
          setMemberDetails(student);
          setCurrentProfilePicture(student.profilePictureUrl || DEFAULT_PROFILE_PLACEHOLDER);
        } else {
          toast({ title: "Error", description: "Could not load your profile data.", variant: "destructive" });
        }
      } catch (error) {
        console.error("Failed to fetch member details:", error);
        toast({ title: "Error", description: "An error occurred while loading your profile.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudent();
  }, [user, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Limit file size to 2MB
        toast({
          title: "File Too Large",
          description: "Please select an image smaller than 2MB.",
          variant: "destructive",
        });
        if(fileInputRef.current) fileInputRef.current.value = "";
        setSelectedFile(null);
        setProfilePicturePreview(null);
        return;
      }
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicturePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfilePicture = async () => {
    if (!profilePicturePreview || !memberDetails) {
      toast({
        title: "No Picture Selected",
        description: "Please select a picture to update.",
        variant: "destructive",
      });
      return;
    }
  
    setIsSavingPicture(true);
    // Simulate client-side update for now
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    
    setCurrentProfilePicture(profilePicturePreview); // Update displayed picture
    
    // Update local studentDetails state if you want to reflect it in other parts that might use memberDetails.profilePictureUrl
    // This part is optional as currentProfilePicture is directly used for Avatar src
    // setMemberDetails(prev => prev ? ({ ...prev, profilePictureUrl: profilePicturePreview }) : null);

    toast({
      title: "Profile Picture Preview Updated",
      description: "Your new profile picture is previewed. (Note: Not saved to server in this version).",
    });
  
    setIsSavingPicture(false);
    setProfilePicturePreview(null); // Clear preview
    setSelectedFile(null); // Clear selected file
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Reset file input
    }
  };

  if (isLoading) {
    return (
      <>
        <PageTitle title="My Profile" description="Loading your details..." />
        <div className="flex justify-center items-center py-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </>
    );
  }

  if (!memberDetails) {
     return (
      <>
        <PageTitle title="My Profile" description="Could not load your profile information." />
        <Card className="shadow-md">
          <CardContent className="pt-6 text-center text-muted-foreground">
            Please try again later or contact support if the issue persists.
          </CardContent>
        </Card>
      </>
    );
  }

  const displayName = memberDetails.name || user?.email?.split('@')[0] || "Member";

  return (
    <>
      <PageTitle title="My Profile" description="View your details." />
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">  
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
          <div className="flex items-center">
          <SquareUser className="mr-3 h-5 w-5 text-muted-foreground " />
          <CardTitle>My Details</CardTitle>
          </div>  
          <CardDescription>Your current information on record. Contact admin to change these details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center">
              <UserCircle className="mr-3 h-5 w-5 text-muted-foreground" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium break-words">{displayName}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="mr-3 h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Email Address</p>
                <p className="font-medium break-words">{memberDetails.email || user?.email}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Phone className="mr-3 h-5 w-5 text-muted-foreground flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium break-words">{memberDetails.phone}</p>
              </div>
            </div>
             <div className="flex items-center">
              <BookOpen className="mr-3 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Shift</p>
                <p className="font-medium capitalize">{memberDetails.shift}</p>
              </div>
            </div>
             <div className="flex items-center">
              <MapPin className="mr-3 h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Seat Number</p>
                <p className="font-medium">{memberDetails.seatNumber || "N/A (Not Assigned / Left)"}</p>
              </div>
            </div>
             {memberDetails.idCardFileName && (
                <div className="pt-2">
                    <p className="text-sm font-medium">ID Card:</p>
                    <div className="mt-1 p-2 border rounded-md bg-muted/50 inline-block">
                        <Image src={ID_CARD_PLACEHOLDER} alt="ID Card Preview" width={150} height={100} className="rounded-md max-w-full object-contain" data-ai-hint="document id card" />
                        <p className="text-xs text-muted-foreground pt-1 truncate max-w-[150px]">{memberDetails.idCardFileName} (Preview)</p>
                    </div>
                </div>
            )}
          </CardContent>
           <CardFooter>
             <Link href="/member/fees" passHref legacyBehavior>
                <Button variant="outline" size="sm">
                  <IndianRupee className="mr-2 h-4 w-4" /> View Payment History
                </Button>
              </Link>
          </CardFooter>
        </Card>
      </div>
    </>
  );
}
