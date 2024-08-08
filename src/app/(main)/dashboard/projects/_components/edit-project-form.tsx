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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { updateProjectSchema } from "@/server/api/routers/project/project.input";
import { api } from "@/trpc/react";

import type { UpdateProjectInput } from "@/server/api/routers/project/project.input";
import type { RouterOutputs } from "@/trpc/shared";
type Project = RouterOutputs["project"]["list"][number];

type EditProjectTriggerProps = {
  project: Project;
};

export function EditProjectTrigger({ project }: EditProjectTriggerProps) {
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
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>Make changes to your project here.</DialogDescription>
          </DialogHeader>
          <EditProjectForm project={project} closeModal={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Edit Project</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit Project</DrawerTitle>
          <DrawerDescription>Make changes to your project here.</DrawerDescription>
        </DrawerHeader>
        <EditProjectForm className="px-4" project={project} closeModal={() => setOpen(false)} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function EditProjectForm({
  project,
  className,
  closeModal,
}: EditProjectTriggerProps & { className?: string; closeModal?: () => void }) {
  const form = useForm<UpdateProjectInput>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: {
      id: project.id,
      name: project.name,
      description: project.description ?? undefined,
      subdomain: project.subdomain!,
      androidAppId: project.androidAppId ?? undefined,
      iosAppId: project.iosAppId ?? undefined,
    },
  });

  const { data: apps } = api.app.list.useQuery();

  const updateProjectMutation = api.project.update.useMutation({
    onSuccess: () => {
      toast.success("Project updated successfully");
      closeModal?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = (data: UpdateProjectInput) => {
    updateProjectMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subdomain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subdomain</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {apps?.android && apps.android.length > 0 && (
          <FormField
            control={form.control}
            name="androidAppId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Android App</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Android App" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {apps.android.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.packageName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {apps?.ios && apps.ios.length > 0 && (
          <FormField
            control={form.control}
            name="iosAppId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>iOS App</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select iOS App" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {apps.ios.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.bundleId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <Button type="submit" className="w-full" disabled={updateProjectMutation.isLoading}>
          {updateProjectMutation.isLoading ? "Updating..." : "Update Project"}
        </Button>
      </form>
    </Form>
  );
}
