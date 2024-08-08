"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";

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
import { api } from "@/trpc/react";

const customDomainSchema = z.object({
  domain: z
    .string()
    .min(1, "Domain is required")
    .regex(/^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/, "Invalid domain format"),
});

type CustomDomainFormValues = z.infer<typeof customDomainSchema>;

export function CreateCustomDomainTrigger() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const userSubscription = api.payment.getPlan.useQuery();

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button disabled={!userSubscription.data?.isPro}>Add Custom Domain</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add Custom Domain</DialogTitle>
            <DialogDescription>Enter your custom domain here.</DialogDescription>
          </DialogHeader>
          <CustomDomainForm closeModal={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>Add Custom Domain</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add Custom Domain</DrawerTitle>
          <DrawerDescription>Enter your custom domain here.</DrawerDescription>
        </DrawerHeader>
        <CustomDomainForm className="px-4" closeModal={() => setOpen(false)} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function CustomDomainForm({
  className,
  closeModal,
}: {
  className?: string;
  closeModal?: () => void;
}) {
  const form = useForm<CustomDomainFormValues>({
    resolver: zodResolver(customDomainSchema),
    defaultValues: {
      domain: "",
    },
  });

  const createCustomDomainMutation = api.customDomain.create.useMutation({
    onSuccess: () => {
      toast.success("Custom domain added successfully");
      closeModal?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: CustomDomainFormValues) => {
    toast.promise(createCustomDomainMutation.mutateAsync(data), {
      loading: "Adding custom domain...",
      success: "Custom domain added!",
      error: "Failed to add custom domain",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={className}>
        <FormField
          control={form.control}
          name="domain"
          render={({ field }) => (
            <FormItem className="mb-4">
              <FormLabel>Custom Domain</FormLabel>
              <FormControl>
                <Input placeholder="yourdomain.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          Add Custom Domain
        </Button>
      </form>
    </Form>
  );
}
