import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { FilePenLine } from "lucide-react";
import * as React from "react";
import { useFieldArray, useForm } from "react-hook-form";
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
import { cn } from "@/lib/utils";
import { updateAndroidApp, updateIosApp } from "@/server/api/routers/app/app.input";
import { api } from "@/trpc/react";

import type * as z from "zod";

import type { UpdateAndroidApp } from "@/server/api/routers/app/app.input";
import type { RouterOutputs } from "@/trpc/shared";
type AndroidApp = RouterOutputs["app"]["list"]["android"][number];
type IosApp = RouterOutputs["app"]["list"]["ios"][number];

type EditAppTriggerProps = {
  app: AndroidApp | IosApp;
  type: "android" | "ios";
};

export function EditAppTrigger({ app, type }: EditAppTriggerProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon">
            <FilePenLine className="size-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit {type === "android" ? "Android" : "iOS"} App</DialogTitle>
            <DialogDescription>Make changes to your app here.</DialogDescription>
          </DialogHeader>
          <EditAppForm app={app} type={type} closeModal={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" size="icon">
          Edit
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit {type === "android" ? "Android" : "iOS"} App</DrawerTitle>
          <DrawerDescription>Make changes to your app here.</DrawerDescription>
        </DrawerHeader>
        <EditAppForm className="px-4" app={app} type={type} closeModal={() => setOpen(false)} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function EditAppForm({
  app,
  type,
  className,
  closeModal,
}: EditAppTriggerProps & { className?: string; closeModal?: () => void }) {
  const schema = type === "android" ? updateAndroidApp : updateIosApp;

  type FormValues = z.infer<typeof schema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues:
      type === "android"
        ? {
            packageName: (app as AndroidApp).packageName,
            androidSHA256CertFingerprints: (app as AndroidApp).sha256CertFingerprints
              ? (JSON.parse((app as AndroidApp).sha256CertFingerprints) as string[])
              : [""],
            storeLink: app.storeLink,
          }
        : {
            bundleId: (app as IosApp).bundleId,
            teamId: (app as IosApp).teamId,
            storeLink: app.storeLink,
          },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "androidSHA256CertFingerprints" as never,
    rules: { minLength: 1 },
  });

  const updateAppMutation = api.app.patch.useMutation({
    onSuccess: () => {
      toast.success("App updated successfully");
      closeModal?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: FormValues) => {
    if (type === "android") {
      const androidData = data as UpdateAndroidApp;
      androidData.androidSHA256CertFingerprints = androidData.androidSHA256CertFingerprints?.filter(
        (fingerprint) => fingerprint.trim() !== "",
      );
    }
    updateAppMutation.mutate({ id: app.id, [type]: data });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
        <AnimatePresence>
          {type === "android" ? (
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
                      <Input {...field} />
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
                    name={`androidSHA256CertFingerprints.${index}`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="mt-2 flex items-center gap-2">
                            <Input placeholder="SHA256 fingerprint" {...field} />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => remove(index)}
                              disabled={index === 0 && fields.length === 1}
                            >
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
                  onClick={() => append("")}
                  className="mt-2 w-full"
                >
                  Add Fingerprint
                </Button>
              </div>
            </motion.div>
          ) : (
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
                      <Input {...field} />
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
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <FormField
          control={form.control}
          name="storeLink"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Store Link</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={updateAppMutation.isLoading}>
          {updateAppMutation.isLoading ? "Updating..." : "Update App"}
        </Button>
      </form>
    </Form>
  );
}
