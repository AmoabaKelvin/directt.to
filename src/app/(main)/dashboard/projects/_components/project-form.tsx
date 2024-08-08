"use client";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APP_TITLE } from "@/lib/constants";
import { useMediaQuery } from "@/lib/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";

import type { CreateProjectInput } from "@/server/api/routers/project/project.input";

import type { RouterOutputs } from "@/trpc/shared";
import type { SubmitHandler } from "react-hook-form";

type ProjectProps = {
  promises: Promise<[RouterOutputs["app"]["list"]]>;
};

export function CreateProjectTrigger({ promises }: ProjectProps) {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const [appList] = React.use(promises);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Create Project</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Project</DialogTitle>
            <DialogDescription>Fill in the form below to create a new project.</DialogDescription>
          </DialogHeader>
          <ProjectForm appList={appList} closeModal={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button>Create Project</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Create Project</DrawerTitle>
          <DrawerDescription>Fill in the form below to create a new project.</DrawerDescription>
        </DrawerHeader>
        <ProjectForm className="px-4" appList={appList} closeModal={() => setOpen(false)} />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

type ProjectFormProps = {
  appList: RouterOutputs["app"]["list"];
  className?: string;
  closeModal?: () => void;
};

function ProjectForm({ appList, className, closeModal }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateProjectInput>();
  const createNewProjectMutation = api.project.create.useMutation({
    onSuccess: () => {
      toast.success("Project created successfully");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { data: customDomains } = api.customDomain.list.useQuery();

  const onSubmit: SubmitHandler<CreateProjectInput> = (data) => {
    toast.promise(createNewProjectMutation.mutateAsync(data), {
      loading: "Creating project...",
      success: "Project created!",
      error: "Failed to create project",
    });
  };

  const areAppsAvailable = appList.android.length > 0 || appList.ios.length > 0;

  return (
    <form className={cn("grid items-start gap-4", className)} onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4">
        <Label>Name</Label>
        <Input
          type="text"
          placeholder="Project name"
          className={cn({ "border-red-500": errors.name })}
          {...register("name", { required: true })}
        />
      </div>
      <div className="grid gap-2">
        <Label>Description</Label>
        <Input
          type="text"
          placeholder="Project description"
          className={cn({ "border-red-500": errors.description })}
          {...register("description", { required: true })}
        />
      </div>
      <div className="grid gap-2">
        <Label>Subdomain</Label>
        <Input
          type="text"
          placeholder="Subdomain"
          className={cn({ "border-red-500": errors.subdomain })}
          {...register("subdomain")}
        />
        <span className="text-sm text-muted-foreground">
          subdomain.{APP_TITLE.toLowerCase().replace(" ", "")}.com
        </span>
      </div>
      {appList.android.length > 0 && (
        <div className="grid gap-2">
          <Label>Android App</Label>
          <AppSelector
            options={appList.android.map((app) => ({ label: app.packageName, value: app.id }))}
            onChange={(value) => setValue("androidAppId", value)}
          />
        </div>
      )}
      {appList.ios.length > 0 && (
        <div className="grid gap-2">
          <Label>iOS App</Label>
          <AppSelector
            options={appList.ios.map((app) => ({ label: app.bundleId, value: app.id }))}
            onChange={(value) => setValue("iosAppId", value)}
          />
        </div>
      )}
      <div className="grid gap-2">
        <Label>Custom Domain</Label>
        {customDomains && customDomains.length > 0 ? (
          <Select onValueChange={(value) => setValue("customDomain", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select a custom domain" />
            </SelectTrigger>
            <SelectContent>
              {customDomains.map((domain) => (
                <SelectItem key={domain.id} value={domain.domain}>
                  {domain.domain}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <>
            <Input disabled placeholder="No custom domains available" />
            <p className="text-sm text-muted-foreground">
              You haven't configured any custom domains yet. Add one in the Custom Domains page.
            </p>
          </>
        )}
      </div>
      {!areAppsAvailable && (
        <>
          <p className="text-sm text-red-500">
            You need to create an app before creating a project.
          </p>
          <Button
            variant="secondary"
            onClick={(e) => {
              e.preventDefault();
              closeModal?.();
            }}
          >
            Create App
          </Button>
        </>
      )}

      <span
        className={cn("text-sm text-muted-foreground", {
          hidden: !areAppsAvailable,
        })}
      >
        Only apps without projects are shown here.
      </span>
      <Button
        type="submit"
        className={cn("mt-4", { hidden: !areAppsAvailable })}
        disabled={!areAppsAvailable || createNewProjectMutation.isLoading}
      >
        Create Project
      </Button>
    </form>
  );
}

type AppSelectorProps = {
  options: { label: string; value: string }[];
  onChange: (value: string) => void;
};

function AppSelector({ options, onChange }: AppSelectorProps) {
  return (
    <Select onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select App" />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function AppCreationForm() {
  return (
    <div>
      <h1 className="text-3xl font-bold md:text-4xl">Create App</h1>
      <p className="text-sm text-muted-foreground">Create a new app to get started</p>
    </div>
  );
}
