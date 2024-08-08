"use client";

import { Copy, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Alert, AlertDescription } from "@/components/ui/alert";
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

import type { VerificationDetails } from "@/lib/types/custom-domains";
import type { RouterOutputs } from "@/trpc/shared";

type CustomDomainCardProps = {
  domain: RouterOutputs["customDomain"]["list"][number];
};

const CustomDomainCard = ({ domain }: CustomDomainCardProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const utils = api.useUtils();

  const deleteCustomDomainMutation = api.customDomain.delete.useMutation({
    onSuccess: async () => {
      toast.success("Custom domain deleted successfully");
      await utils.customDomain.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete custom domain: ${error.message}`);
    },
  });

  const checkStatusMutation = api.customDomain.checkStatus.useMutation({
    onSuccess: async (data) => {
      if (data.status === "verified") {
        toast.success("Domain verified successfully!");
        await utils.customDomain.list.invalidate();
      }
    },
    onError: (error) => {
      toast.error(`Failed to check domain status: ${error.message}`);
    },
  });

  useEffect(() => {
    if (!domain.verified) {
      const intervalId = setInterval(() => {
        checkStatusMutation.mutate({ domain: domain.domain });
      }, 15000); // Check every 15 seconds

      return () => clearInterval(intervalId);
    }
  }, [domain.verified, domain.domain, checkStatusMutation]);

  const handleDelete = () => {
    toast.promise(deleteCustomDomainMutation.mutateAsync({ id: domain.id }), {
      loading: "Deleting custom domain...",
      success: "Custom domain deleted!",
      error: "Failed to delete custom domain",
    });
    setIsDeleteDialogOpen(false);
  };

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span>{domain.domain}</span>
            <Badge variant={domain.verified ? "secondary" : "destructive"}>
              {domain.verified ? "Verified" : "Unverified"}
            </Badge>
          </div>
          <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Are you sure you want to delete this custom domain?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the custom domain and
                  remove its association with any projects.
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
        {!domain.verified ? (
          <CardContent className="px-0 pt-6">
            <Alert className="mb-7">
              <AlertDescription>
                Warning: If you are using this domain for another site, setting this TXT record will
                transfer domain ownership away from that site and potentially disrupt its
                functionality. Please exercise caution when configuring this record. Ensure that the
                domain specified in the TXT verification value is the one you intend to use with
                ishortn.ink and not your production site.
                <br />
                Domain checks are performed every 30 seconds.
              </AlertDescription>
            </Alert>
            <div className="space-y-4">
              {(JSON.parse(domain.challenges) as VerificationDetails).map((challenge, index) => (
                <div key={index}>
                  <h3 className="mb-2 font-semibold">{challenge.type} Record</h3>
                  <div className="flex items-center gap-2 rounded bg-secondary p-2">
                    <code className="flex-grow text-sm">
                      Name: <strong>{challenge.domain}</strong>
                      <br />
                      <br />
                      Value: {challenge.value}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(`${challenge.domain}\n${challenge.value}`)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div>
                <h3 className="mb-2 font-semibold">Instructions</h3>
                <ol className="list-inside list-decimal space-y-2">
                  <li>
                    There might be multiple verification challenges. You only need to complete one.
                  </li>
                  <li>Copy the record shown above.</li>
                  <li>
                    Go to your DNS provider and add a new record based on the type shown above. E.g.
                    if it's a TXT record, add a new TXT record.
                  </li>
                  <li>Enter the domain and value shown above.</li>
                  <li>Save the changes and wait for DNS propagation (may take up to 48 hours).</li>
                  <li>Once done, click the "Verify" button in the domain settings to confirm.</li>
                </ol>
              </div>
            </div>
          </CardContent>
        ) : null}
        <p className="text-sm text-muted-foreground" suppressHydrationWarning>
          Created: {new Date(domain.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
};

export default CustomDomainCard;
