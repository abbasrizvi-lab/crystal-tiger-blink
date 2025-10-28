"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { XCircle } from "lucide-react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const predefinedVirtues = [
  { id: "resilience", label: "Resilience" },
  { id: "integrity", label: "Integrity" },
  { id: "grit", label: "Grit" },
  { id: "humility", label: "Humility" },
  { id: "thoughtfulness", label: "Thoughtfulness" },
  { id: "courage", label: "Courage" },
  { id: "empathy", label: "Empathy" },
  { id: "wisdom", label: "Wisdom" },
  { id: "persistence", label: "Persistence" },
  { id: "creativity", label: "Creativity" },
] as const;

type Virtue = {
  id: string;
  label: string;
};

const FormSchema = z.object({
  priorityVirtues: z.array(z.string()).refine(
    (val) => val.length >= 2 && val.length <= 3,
    "You must select between 2 and 3 priority virtues.",
  ),
});

const Settings = () => {
  const navigate = useNavigate();
  const [customVirtueInput, setCustomVirtueInput] = React.useState("");
  const [allVirtues, setAllVirtues] = React.useState<Virtue[]>([...predefinedVirtues]);
  const [customVirtues, setCustomVirtues] = React.useState<string[]>([]);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      priorityVirtues: [],
    },
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/users/me/settings`, {
          credentials: 'include',
        });
        if (!response.ok) {
          if (response.status === 401) {
            navigate("/");
          }
          throw new Error("Failed to fetch settings");
        }
        if (!response.ok) throw new Error("Failed to fetch settings");
        const settings = await response.json();
        form.reset({ priorityVirtues: settings.priorityVirtues });
        setCustomVirtues(settings.customVirtues);
        const customVirtuesObjects = settings.customVirtues.map((v: string) => ({ id: v.toLowerCase().replace(/\s/g, '-'), label: v }));
        setAllVirtues([...predefinedVirtues, ...customVirtuesObjects]);
      } catch (error) {
        toast.error(String(error));
      }
    };
    fetchSettings();
  }, [form, navigate]);

  const updateAllVirtues = (updatedCustomVirtues: string[]) => {
    const customVirtuesObjects = updatedCustomVirtues.map((v: string) => ({ id: v.toLowerCase().replace(/\s/g, '-'), label: v }));
    setAllVirtues([...predefinedVirtues, ...customVirtuesObjects]);
  };

  const handleAddCustomVirtue = () => {
    const trimmedInput = customVirtueInput.trim();
    if (trimmedInput && !customVirtues.some(v => v.toLowerCase() === trimmedInput.toLowerCase())) {
      const updatedCustomVirtues = [...customVirtues, trimmedInput];
      setCustomVirtues(updatedCustomVirtues);
      updateAllVirtues(updatedCustomVirtues);
      setCustomVirtueInput("");
      toast.success(`Custom virtue "${trimmedInput}" added locally. Save to confirm.`);
    } else {
      toast.error("Virtue already exists or is empty.");
    }
  };

  const handleRemoveCustomVirtue = (virtueLabel: string) => {
    const updatedCustomVirtues = customVirtues.filter(v => v !== virtueLabel);
    setCustomVirtues(updatedCustomVirtues);
    updateAllVirtues(updatedCustomVirtues);
    
    const currentPriorityVirtues = form.getValues("priorityVirtues");
    const virtueId = virtueLabel.toLowerCase().replace(/\s/g, '-');
    const updatedPriorityVirtues = currentPriorityVirtues.filter(id => id !== virtueId);
    form.setValue("priorityVirtues", updatedPriorityVirtues);
    
    toast.success("Custom virtue removed locally. Save to confirm.");
  };

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    try {
      const response = await fetch(`${API_URL}/users/me/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify({
          priorityVirtues: data.priorityVirtues,
          customVirtues: customVirtues,
        }),
      });
      if (!response.ok) throw new Error("Failed to update settings");
      toast.success("Priority virtues updated!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(String(error));
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Adjust Priority Virtues</CardTitle>
          <CardDescription className="text-center text-muted-foreground">
            Update the 2-3 virtues you wish to focus on.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="priorityVirtues"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Available Virtues</FormLabel>
                      <FormDescription>
                        Choose the virtues most important for your innovation journey.
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {allVirtues.map((item) => (
                        <FormField
                          key={item.id}
                          control={form.control}
                          name="priorityVirtues"
                          render={({ field }) => {
                            const isCustom = !predefinedVirtues.some(v => v.id === item.id);
                            return (
                              <FormItem
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...field.value, item.id]
                                        : field.value?.filter(
                                            (value) => value !== item.id,
                                          );
                                      field.onChange(newValue);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer flex-grow">
                                  {item.label}
                                </FormLabel>
                                {isCustom && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleRemoveCustomVirtue(item.label);
                                    }}
                                    className="h-6 w-6"
                                  >
                                    <XCircle className="h-4 w-4 text-red-500" />
                                  </Button>
                                )}
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-semibold">Add Custom Virtue</h3>
                <div className="flex space-x-2">
                  <Input
                    placeholder="e.g., 'Patience'"
                    value={customVirtueInput}
                    onChange={(e) => setCustomVirtueInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCustomVirtue();
                      }
                    }}
                  />
                  <Button type="button" onClick={handleAddCustomVirtue}>Add</Button>
                </div>
              </div>

              <Button type="submit" className="w-full">Save Changes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;