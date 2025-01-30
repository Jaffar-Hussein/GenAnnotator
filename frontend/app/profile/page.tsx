'use client'
import React, { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { UserRound, Mail, Shield, Edit2, Save, X, Info } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { motion, AnimatePresence } from "framer-motion";

const ProfilePage = () => {
  const user = useAuthStore((state) => state.user);
  const [userData, setUserData] = useState(user);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(user);

  const handleEdit = () => {
    setIsEditing(true);
    setEditData(userData);
  };

  const handleSave = () => {
    setUserData(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData(userData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name) => {
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
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Profile Information</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400">Manage your account details and preferences</p>
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
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Basic Information</h3>
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
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      size="sm"
                      className="border-slate-200 hover:border-indigo-300 dark:border-slate-700 dark:hover:border-indigo-700"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Username
                  </Label>
                  {isEditing ? (
                    <Input
                      id="username"
                      name="username"
                      value={editData.username}
                      onChange={handleChange}
                      className="border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-slate-200 font-medium">{userData.username}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Email Address
                  </Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={editData.email}
                      onChange={handleChange}
                      className="border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-slate-200 font-medium">{userData.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="first_name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    First Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="first_name"
                      name="first_name"
                      value={editData.first_name}
                      onChange={handleChange}
                      className="border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-slate-200 font-medium">{userData.first_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Last Name
                  </Label>
                  {isEditing ? (
                    <Input
                      id="last_name"
                      name="last_name"
                      value={editData.last_name}
                      onChange={handleChange}
                      className="border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800"
                    />
                  ) : (
                    <p className="text-slate-900 dark:text-slate-200 font-medium">{userData.last_name}</p>
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
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Role & Permissions</h3>
              </div>

              <div className="space-y-4 bg-slate-50 dark:bg-gray-800/50 rounded-lg p-4 border border-slate-200/60 dark:border-gray-700/60">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</Label>
                  <Badge variant="secondary" className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-0">
                    {userData.role}
                  </Badge>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="is_superuser" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Super User Access
                    </Label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Full system administrative privileges</p>
                  </div>
                  <Switch
                    id="is_superuser"
                    checked={isEditing ? editData.is_superuser : userData.is_superuser}
                    onCheckedChange={() => isEditing && handleSwitchChange("is_superuser")}
                    disabled={!isEditing}
                    className="data-[state=checked]:bg-indigo-500 dark:data-[state=checked]:bg-indigo-600"
                  />
                </div>

                <div className="flex items-center justify-between py-2">
                  <div>
                    <Label htmlFor="is_staff" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Staff Member Access
                    </Label>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Access to administrative dashboard</p>
                  </div>
                  <Switch
                    id="is_staff"
                    checked={isEditing ? editData.is_staff : userData.is_staff}
                    onCheckedChange={() => isEditing && handleSwitchChange("is_staff")}
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
                <span>Changes will be saved when you click the Save Changes button</span>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;