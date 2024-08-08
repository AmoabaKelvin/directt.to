"use client";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";

import { EditAppTrigger } from "./edit-app-form";

import type { RouterOutputs } from "@/trpc/shared";
type AndroidApp = RouterOutputs["app"]["list"]["android"][number];
type IosApp = RouterOutputs["app"]["list"]["ios"][number];

type AppCardProps = {
  app: AndroidApp | IosApp;
  type: "android" | "ios";
};

const AppCard = ({ app, type }: AppCardProps) => {
  const deleteAppMutation = api.app.delete.useMutation();

  const handleDelete = async () => {
    try {
      toast.promise(deleteAppMutation.mutateAsync({ id: app.id, kind: type }), {
        loading: "Deleting app...",
        success: "App deleted!",
        error: "Failed to delete app",
      });
    } catch (error) {
      console.error("Failed to delete app:", error);
    }
  };

  // Use type assertion based on the type prop
  const androidApp = type === "android" ? (app as AndroidApp) : null;
  const iosApp = type === "ios" ? (app as IosApp) : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>{type === "android" ? androidApp?.packageName : iosApp?.bundleId}</span>
            <Badge variant="secondary">{type === "android" ? "Android" : "iOS"}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <EditAppTrigger app={app} type={type} />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to delete this app?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the app and remove
                    its data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Store Link: {app.storeLink}</p>
        {type === "android" && androidApp && (
          <p className="mt-2 text-sm text-muted-foreground">
            SHA256: [
            {(JSON.parse(androidApp.sha256CertFingerprints) as string[])
              .map((item) => item.slice(0, 8) + "...")
              .join(", ")}
            ]
          </p>
        )}
        {type === "ios" && iosApp && (
          <p className="mt-2 text-sm text-muted-foreground">Team ID: {iosApp.teamId}</p>
        )}
        <p className="mt-2 text-sm text-muted-foreground">
          Created: {new Date(app.createdAt).toDateString()}
        </p>
      </CardContent>
    </Card>
  );
};

export default AppCard;
