import { zodResolver } from "@hookform/resolvers/zod";
import { FilePenLine } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { updateLinkSchema } from "@/server/api/routers/link/link.input";
import { api } from "@/trpc/react";

import type { UpdateLinkInput } from "@/server/api/routers/link/link.input";
import type { RouterOutputs } from "@/trpc/shared";
type Link = RouterOutputs["link"]["list"][number];

type EditLinkTriggerProps = {
  link: Link;
};

export function EditLinkTrigger({ link }: EditLinkTriggerProps) {
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
            <DialogTitle>Edit Link</DialogTitle>
            <DialogDescription>Make changes to your link here.</DialogDescription>
          </DialogHeader>
          <EditLinkForm link={link} closeModal={() => setOpen(false)} />
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
          <DrawerTitle>Edit Link</DrawerTitle>
          <DrawerDescription>Make changes to your link here.</DrawerDescription>
        </DrawerHeader>
        <EditLinkForm className="px-4" link={link} closeModal={() => setOpen(false)} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function EditLinkForm({
  link,
  className,
  closeModal,
}: EditLinkTriggerProps & { className?: string; closeModal?: () => void }) {
  const form = useForm<UpdateLinkInput>({
    resolver: zodResolver(updateLinkSchema),
    defaultValues: {
      id: link.linkId,
      url: link.url,
      metadata: {
        title: link.metaTitle ?? undefined,
        description: link.metaDescription ?? undefined,
        image: link.metaImage ?? undefined,
      },
    },
  });

  const utils = api.useUtils();

  const updateLinkMutation = api.link.update.useMutation({
    onSuccess: async () => {
      toast.success("Link updated successfully");
      await utils.link.list.invalidate();
      closeModal?.();
    },
    onError: (error) => {
      toast.error(`Failed to update link: ${error.message}`);
    },
  });

  const onSubmit = (data: UpdateLinkInput) => {
    updateLinkMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <p className="mt-2 text-sm text-muted-foreground">
          Note: If no metadata was provided when creating the link, the prefilled ones below will be
          from the link you are editing.
        </p>
        <FormField
          control={form.control}
          name="metadata.title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Title (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="metadata.description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Description (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="metadata.image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Image URL (Optional)</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={updateLinkMutation.isLoading}>
          {updateLinkMutation.isLoading ? "Updating..." : "Update Link"}
        </Button>
      </form>
    </Form>
  );
}
