"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { UserRound, Mail, Shield, Edit2, Save, X, Info } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { motion } from "framer-motion";
import { useBanner } from "@/components/Banner";

interface UserData {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  is_superuser: boolean;
  is_staff: boolean;
  role: string;
}

const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const updateUserProfile = useAuthStore((state) => state.updateUserProfile);
  const AccessToken = useAuthStore((state) => state.accessToken);
  const [userData, setUserData] = useState<UserData>(user as UserData);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UserData>(user as UserData);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const { showBanner } = useBanner();

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(userData);
  };

  const handleSave = async () => {
    setIsLoading(true);
    
    // Compare editData with original userData to find changed fields
    const changedFields = Object.entries(editData).reduce((acc, [key, value]) => {
      if (userData[key as keyof UserData] !== value) {
        acc[key] = value;
      }
      return acc;
    }, {} as Partial<UserData>);
  
    // If no fields changed, return early
    if (Object.keys(changedFields).length === 0) {
      showBanner("No changes were made", "info");
      setIsEditing(false);
      setIsLoading(false);
      return;
    }
  
    try {
      const response = await fetch("http://localhost:8000/access/api/user/profile/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${AccessToken}`,
        },
        body: JSON.stringify(changedFields),
      });
  
      const data = await response.json();
      
      if (!response.ok) {
        if (data.error) {
          try {
            const errorString = data.error;
            const matches = errorString.match(/'([^']+)': \[ErrorDetail\(string='([^']+)'.*?\)\]/);
            
            if (matches) {
              const [, field, message] = matches;
              setErrors({ [field]: [message] });
              showBanner("Please fix the validation errors", "error");
            } else {
              showBanner("Failed to update profile", "error");
            }
          } catch {
            showBanner(data.error || "Failed to update profile", "error");
          }
          return;
        }
        throw new Error('Failed to update profile');
      }
  
      if (data.success) {
        updateUserProfile(data.success);
        setUserData((prev) => ({ ...prev, ...data.success }));
        setIsEditing(false);
        setErrors({});
        showBanner("Profile updated successfully", "success");
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      showBanner("Failed to update profile. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(userData);
    setErrors({});
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name: keyof UserData) => {
    setEditData((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-8 md:px-8 md:py-12">
        <Card className="overflow-hidden bg-white dark:bg-gray-800 shadow-sm border border-slate-200/60 dark:border-gray-700/60">
          {/* Header Section */}
          <div className="p-8 bg-gradient-to-r from-slate-50/50 to-white dark:from-gray-800 dark:to-gray-800/50 border-b border-slate-200/60 dark:border-gray-700/60">
            <div className="flex items-center space-x-3 mb-2">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                <UserRound className="h-5 w-5 text-indigo-500 dark:text-indigo-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">
                  Profile Information
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Manage your account details and preferences
                </p>
              </div>
            </div>
          </div>

          <CardContent className="p-8 space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Basic Information
                  </h3>
                </div>
                {!isEditing ? (
                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    size="sm"
                    className="border-slate-200 hover:border-indigo-300 dark:border-slate-700 dark:hover:border-indigo-700"
                  >
                    <Edit2 className="w-4 h-4 mr-2 text-indigo-500 dark:text-indigo-400" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button
                      onClick={handleSave}
                      size="sm"
                      className="bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-500/90 dark:hover:bg-indigo-500/70"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="animate-spin mr-2">⚪</span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                      className="border-slate-200 hover:border-indigo-300 dark:border-slate-700 dark:hover:border-indigo-700"
                      disabled={isLoading}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="username"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Username
                  </Label>
                  {isEditing ? (
                    <div className="space-y-1">
                      <Input
                        id="username"
                        name="username"
                        value={editData.username}
                        onChange={handleChange}
                        className={`border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 ${
                          errors.username
                            ? "border-red-500 dark:border-red-500"
                            : ""
                        }`}
                      />
                      {errors.username && (
                        <p className="text-sm text-red-500 dark:text-red-400">
                          {errors.username[0]}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-900 dark:text-slate-200 font-medium">
                      {userData?.username}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Email Address
                  </Label>
                  {isEditing ? (
                    <div className="space-y-1">
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={editData.email}
                        onChange={handleChange}
                        className={`border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 ${
                          errors.email
                            ? "border-red-500 dark:border-red-500"
                            : ""
                        }`}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 dark:text-red-400">
                          {errors.email[0]}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-900 dark:text-slate-200 font-medium">
                      {userData.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="first_name"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    First Name
                  </Label>
                  {isEditing ? (
                    <div className="space-y-1">
                      <Input
                        id="first_name"
                        name="first_name"
                        value={editData.first_name}
                        onChange={handleChange}
                        className={`border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 ${
                          errors.first_name
                            ? "border-red-500 dark:border-red-500"
                            : ""
                        }`}
                      />
                      {errors.first_name && (
                        <p className="text-sm text-red-500 dark:text-red-400">
                          {errors.first_name[0]}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-900 dark:text-slate-200 font-medium">
                      {userData.first_name}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="last_name"
                    className="text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    Last Name
                  </Label>
                  {isEditing ? (
                    <div className="space-y-1">
                      <Input
                        id="last_name"
                        name="last_name"
                        value={editData.last_name}
                        onChange={handleChange}
                        className={`border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 ${
                          errors.last_name
                            ? "border-red-500 dark:border-red-500"
                            : ""
                        }`}
                      />
                      {errors.last_name && (
                        <p className="text-sm text-red-500 dark:text-red-400">
                          {errors.last_name[0]}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-slate-900 dark:text-slate-200 font-medium">
                      {userData.last_name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Role & Permissions Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Shield className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Role & Permissions
                </h3>
              </div>

              <div className="space-y-4 bg-slate-50 dark:bg-gray-800/50 rounded-lg p-4 border border-slate-200/60 dark:border-gray-700/60">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Role
                  </Label>
                  <Badge
                    variant="secondary"
                    className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-0"
                  >
                    {userData.role}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label
                      htmlFor="is_superuser"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Super User Access
                    </Label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Full system administrative privileges
                    </p>
                  </div>
                  <Switch
                    id="is_superuser"
                    checked={
                      isEditing ? editData.is_superuser : userData.is_superuser
                    }
                    onCheckedChange={() =>
                      isEditing && handleSwitchChange("is_superuser")
                    }
                    disabled={!isEditing}
                    className="data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:bg-indigo-600"
                  />
                </div>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label
                      htmlFor="is_staff"
                      className="text-sm font-medium text-slate-700 dark:text-slate-300"
                    >
                      Staff Member Access
                    </Label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Access to administrative dashboard
                    </p>
                  </div>
                  <Switch
                    id="is_staff"
                    checked={isEditing ? editData.is_staff : userData.is_staff}
                    onCheckedChange={() =>
                      isEditing && handleSwitchChange("is_staff")
                    }
                    disabled={!isEditing}
                    className="data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:bg-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Info Footer */}
            {isEditing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400 pt-4"
              >
                <Info className="h-4 w-4" />
                <span>
                  Changes will be saved when you click the Save Changes button
                </span>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
