"use client";

import { Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PROJECT_DOMAIN } from "@/lib/constants";
import { api } from "@/trpc/react";

import { EditProjectTrigger } from "./edit-project-form";

import type { RouterOutputs } from "@/trpc/shared";
type ProjectCardProps = {
  project: RouterOutputs["project"]["list"][number];
};

const ProjectCard = ({ project }: ProjectCardProps) => {
  const pathName = usePathname();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const utils = api.useUtils();

  const deleteProjectMutation = api.project.delete.useMutation({
    onSuccess: async () => {
      toast.success("Project deleted successfully");
      await utils.project.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete project: ${error.message}`);
    },
  });

  const handleDelete = () => {
    toast.promise(deleteProjectMutation.mutateAsync({ id: project.id }), {
      loading: "Deleting project...",
      success: "Project deleted!",
      error: "Failed to delete project",
    });
    setIsDeleteDialogOpen(false);
  };
  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="truncate">{project.name}</span>
            {pathName === "/dashboard/projects" && (
              <Badge variant="secondary">
                {project.customDomain ? project.customDomain : project.subdomain + PROJECT_DOMAIN}
              </Badge>
            )}
          </div>
          {pathName === "/dashboard/projects" && (
            <div className="flex items-center space-x-2">
              <EditProjectTrigger project={project} />
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you sure you want to delete this project?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the project, all
                      associated links, and remove connections to any Android or iOS apps.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardTitle>
        <CardDescription>{project.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          <span>Assciated Links: {project.links}</span>
          <span>Created: {new Date(project.createdAt).toDateString()}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;
