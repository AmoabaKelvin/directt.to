"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";

import type { APIToken } from "@/server/db/schema";

type TokenCardProps = {
  token: APIToken;
};

const TokenCard = ({ token }: TokenCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const utils = api.useUtils();

  const deleteTokenMutation = api.token.delete.useMutation({
    onSuccess: async () => {
      toast.success("API token deleted successfully");
      await utils.token.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete API token: ${error.message}`);
    },
  });

  const handleDelete = () => {
    toast.promise(deleteTokenMutation.mutateAsync({ id: token.id }), {
      loading: "Deleting token...",
      success: "Token deleted!",
      error: "Failed to delete token",
    });
    setIsDeleteDialogOpen(false);
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{token.name}</span>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure you want to delete this API token?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. All applications using this token will no longer be
                  able to access the API.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Token: {token.firstFourChars}...</p>
        <p className="text-sm text-muted-foreground" suppressHydrationWarning>
          Created: {new Date(token.createdAt).toLocaleDateString()}
        </p>
        {token.lastUsedAt && (
          <p className="text-sm text-muted-foreground">
            Last used: {new Date(token.lastUsedAt).toLocaleString()}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenCard;
