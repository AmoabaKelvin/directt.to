"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

import type { CreateAndroidApp, CreateIosApp } from "@/server/api/routers/app/app.input";

const appFormSchema = z
  .object({
    type: z.enum(["android", "ios"]),
    packageName: z.string().optional(),
    bundleId: z.string().optional(),
    teamId: z.string().optional(),
    storeLink: z.string().url("Please enter a valid URL"),
    sha256CertFingerprints: z
      .array(
        z.object({
          value: z.string(),
        }),
      )
      .optional(),
  })
  .refine(
    (data) => {
      if (data.type === "android") {
        return data.packageName && data.sha256CertFingerprints;
      }
      if (data.type === "ios") {
        return data.bundleId && data.teamId;
      }
      return false;
    },
    {
      message: "Please fill in all required fields for the selected app type",
      path: ["type"],
    },
  );

type AppFormValues = z.infer<typeof appFormSchema>;

export function CreateAppTrigger() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Add New App</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New App</DialogTitle>
            <DialogDescription>Fill in the form below to add a new app.</DialogDescription>
          </DialogHeader>
          <AppForm closeModal={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>Add New App</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Add New App</DrawerTitle>
          <DrawerDescription>Fill in the form below to add a new app.</DrawerDescription>
        </DrawerHeader>
        <AppForm className="px-4" closeModal={() => setOpen(false)} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function AppForm({ className, closeModal }: { className?: string; closeModal?: () => void }) {
  const form = useForm<AppFormValues>({
    resolver: zodResolver(appFormSchema),
    defaultValues: {
      type: undefined,
      sha256CertFingerprints: [{ value: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "sha256CertFingerprints",
  });

  const appType = form.watch("type");

  const createAndroidAppMutation = api.app.createAndroid.useMutation({
    onSuccess: () => {
      toast.success("Android app created successfully");
      closeModal?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const createIosAppMutation = api.app.createIos.useMutation({
    onSuccess: () => {
      toast.success("iOS app created successfully");
      closeModal?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: AppFormValues) => {
    if (data.type === "android") {
      const androidAppData: CreateAndroidApp = {
        packageName: data.packageName!,
        androidSHA256CertFingerprints: data.sha256CertFingerprints!.map((fp) => fp.value),
        storeLink: data.storeLink,
      };
      toast.promise(createAndroidAppMutation.mutateAsync(androidAppData), {
        loading: "Adding Android app...",
        success: "Android app added successfully",
        error: "Failed to add Android app",
      });
    } else {
      const iosAppData: CreateIosApp = {
        bundleId: data.bundleId!,
        teamId: data.teamId!,
        storeLink: data.storeLink,
      };
      toast.promise(createIosAppMutation.mutateAsync(iosAppData), {
        loading: "Adding iOS app...",
        success: "iOS app added successfully",
        error: "Failed to add iOS app",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-2", className)}>
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>App Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select app type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="android">Android</SelectItem>
                  <SelectItem value="ios">iOS</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <AnimatePresence mode="wait">
          {appType === "android" && (
            <motion.div
              key="android-fields"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="packageName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Package Name</FormLabel>
                    <FormControl>
                      <Input placeholder="com.example.app" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormLabel>SHA256 Certificate Fingerprints</FormLabel>
                {fields.map((field, index) => (
                  <FormField
                    key={field.id}
                    control={form.control}
                    name={`sha256CertFingerprints.${index}.value`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="mt-2 flex items-center gap-2">
                            <Input placeholder="SHA256 fingerprint" {...field} />
                            <Button type="button" variant="outline" onClick={() => remove(index)}>
                              Remove
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ value: "" })}
                  className="mt-2 w-full"
                >
                  Add Fingerprint
                </Button>
              </div>
            </motion.div>
          )}

          {appType === "ios" && (
            <motion.div
              key="ios-fields"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="bundleId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bundle ID</FormLabel>
                    <FormControl>
                      <Input placeholder="com.example.app" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="teamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team ID</FormLabel>
                    <FormControl>
                      <Input placeholder="ABCDE12345" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {appType && (
            <motion.div
              key="store-link-and-submit"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="storeLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Link</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://play.google.com/store/apps/details?id=com.example.app"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full">
                Add App
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </Form>
  );
}
