"use client";

import { BarChart2, ExternalLink, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { AndroidLogo, AppleLogo } from "@/components/icons";
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

import { EditLinkTrigger } from "./link-edit-form";

import type { RouterOutputs } from "@/trpc/shared";

type LinkCardProps = {
  link: RouterOutputs["link"]["list"][number];
};

const LinkCard = ({ link }: LinkCardProps) => {
  const pathName = usePathname();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const utils = api.useUtils();

  const deleteLinkMutation = api.link.delete.useMutation({
    onSuccess: async () => {
      toast.success("Link deleted successfully");
      await utils.link.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete link: ${error.message}`);
    },
  });

  const handleDelete = () => {
    toast.promise(deleteLinkMutation.mutateAsync({ id: link.linkId }), {
      loading: "Deleting link...",
      success: "Link deleted!",
      error: "Failed to delete link",
    });
    setIsDeleteDialogOpen(false);
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="truncate text-base">{link.shortUrl}</span>
            <Badge variant="outline">{link.projectName}</Badge>
          </div>
          {pathName === "/dashboard/links" && (
            <div className="flex items-center space-x-2">
              <EditLinkTrigger link={link} />
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure you want to delete this link?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the link and remove
                      its data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={deleteLinkMutation.isLoading}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="flex items-center text-sm">
            <ExternalLink className="mr-2 h-4 w-4" />
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate text-blue-500 hover:underline"
            >
              {link.url}
            </a>
          </div>
          <div className="flex flex-col space-y-1 text-sm text-gray-400 md:flex-row md:items-center md:space-x-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <BarChart2 className="h-4 w-4" />
              <span>{link.clicks} clicks</span>
            </div>

            <div className="flex items-center space-x-2">
              <AppleLogo className="h-4 w-4 opacity-50" />
              <span>{link.appStoreRedirects} app store redirects</span>
            </div>

            <div className="flex items-center space-x-2">
              <AndroidLogo className="size-5 opacity-50 grayscale" />
              <span>{link.playstoreRedirects} playstore redirects</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkCard;
