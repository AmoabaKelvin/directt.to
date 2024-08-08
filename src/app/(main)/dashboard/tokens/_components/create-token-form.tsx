"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Copy } from "lucide-react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { createTokenSchema } from "@/server/api/routers/token/token.input";
import { api } from "@/trpc/react";

import type { CreateTokenInput } from "@/server/api/routers/token/token.input";

export function CreateTokenTrigger() {
  const [open, setOpen] = React.useState(false);
  const [newToken, setNewToken] = React.useState<string | null>(null);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleClose = () => {
    setOpen(false);
    setNewToken(null);
  };

  const Content = newToken ? (
    <NewTokenDisplay token={newToken} onClose={handleClose} />
  ) : (
    <CreateTokenForm onTokenCreated={(token) => setNewToken(token)} />
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Create API Token</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{newToken ? "Your New API Token" : "Create API Token"}</DialogTitle>
            <DialogDescription>
              {newToken
                ? "Make sure to copy your new API token. You won't be able to see it again!"
                : "Create a new API token to access the API."}
            </DialogDescription>
          </DialogHeader>
          {Content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>Create API Token</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>{newToken ? "Your New API Token" : "Create API Token"}</DrawerTitle>
          <DrawerDescription>
            {newToken
              ? "Make sure to copy your new API token. You won't be able to see it again!"
              : "Create a new API token to access the API."}
          </DrawerDescription>
        </DrawerHeader>
        <div className="px-4">{Content}</div>
        {!newToken && (
          <DrawerFooter className="pt-2">
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  );
}

function CreateTokenForm({ onTokenCreated }: { onTokenCreated: (token: string) => void }) {
  const form = useForm<CreateTokenInput>({
    resolver: zodResolver(createTokenSchema),
  });

  const createTokenMutation = api.token.create.useMutation({
    onSuccess: (data) => {
      onTokenCreated(data.token);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: CreateTokenInput) => {
    toast.promise(createTokenMutation.mutateAsync(data), {
      loading: "Creating token...",
      success: "Token created!",
      error: "Failed to create token",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Token Name</FormLabel>
              <FormControl>
                <Input placeholder="My API Token" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          Create Token
        </Button>
      </form>
    </Form>
  );
}

function NewTokenDisplay({ token, onClose }: { token: string; onClose: () => void }) {
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(token);
    toast.success("Token copied to clipboard");
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-md p-4">
        <p className="mt-2 break-all font-mono text-sm">{token}</p>
        <Button onClick={copyToClipboard} size="icon" variant="outline">
          <Copy className="size-4" />
        </Button>
      </div>
    </div>
  );
}
