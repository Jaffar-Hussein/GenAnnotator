"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Shield, Edit2, Save, X } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

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
    <div className="min-h-screen p-8 bg-white dark:bg-gray-950">
      <Card className="max-w-2xl mx-auto mt-8 border-indigo-100 dark:border-indigo-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Profile Information
            </CardTitle>
            {!isEditing ? (
              <Button onClick={handleEdit} variant="outline" size="sm" className="border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-900">
                <Edit2 className="w-4 h-4 mr-2 text-indigo-600 dark:text-indigo-400" />
                Edit Profile
              </Button>
            ) : (
              <div className="space-x-2">
                <Button onClick={handleSave} variant="default" size="sm" className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600">
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
                <Button onClick={handleCancel} variant="outline" size="sm" className="border-indigo-200 hover:bg-indigo-50 dark:border-indigo-800 dark:hover:bg-indigo-900">
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Basic Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-700 dark:text-gray-300">Username</Label>
                {isEditing ? (
                  <Input
                    id="username"
                    name="username"
                    value={editData.username}
                    onChange={handleChange}
                    className="border-indigo-100 focus:ring-indigo-500 dark:border-indigo-800 dark:bg-gray-900"
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300">{userData.username}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email</Label>
                {isEditing ? (
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={editData.email}
                    onChange={handleChange}
                    className="border-indigo-100 focus:ring-indigo-500 dark:border-indigo-800 dark:bg-gray-900"
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300">{userData.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-gray-700 dark:text-gray-300">First Name</Label>
                {isEditing ? (
                  <Input
                    id="first_name"
                    name="first_name"
                    value={editData.first_name}
                    onChange={handleChange}
                    className="border-indigo-100 focus:ring-indigo-500 dark:border-indigo-800 dark:bg-gray-900"
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300">{userData.first_name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-gray-700 dark:text-gray-300">Last Name</Label>
                {isEditing ? (
                  <Input
                    id="last_name"
                    name="last_name"
                    value={editData.last_name}
                    onChange={handleChange}
                    className="border-indigo-100 focus:ring-indigo-500 dark:border-indigo-800 dark:bg-gray-900"
                  />
                ) : (
                  <p className="text-gray-700 dark:text-gray-300">{userData.last_name}</p>
                )}
              </div>
            </div>
          </div>

          {/* Role and Permissions */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Role & Permissions</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="role" className="text-gray-700 dark:text-gray-300">Role</Label>
                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
                  {userData.role}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_superuser" className="text-gray-700 dark:text-gray-300">Super User</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Has full system access
                  </p>
                </div>
                <Switch
                  id="is_superuser"
                  checked={isEditing ? editData.is_superuser : userData.is_superuser}
                  onCheckedChange={() => isEditing && handleSwitchChange("is_superuser")}
                  disabled={!isEditing}
                  className="data-[state=checked]:bg-indigo-600 dark:data-[state=checked]:bg-indigo-500"
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_staff" className="text-gray-700 dark:text-gray-300">Staff Member</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Has access to admin panel
                  </p>
                </div>
                <Switch
                  id="is_staff"
                  checked={isEditing ? editData.is_staff : userData.is_staff}
                  onCheckedChange={() => isEditing && handleSwitchChange("is_staff")}
                  disabled={!isEditing}
                  className="data-[state=checked]:bg-indigo-600 dark:data-[state=checked]:bg-indigo-500"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;