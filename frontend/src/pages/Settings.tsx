"use client";

import React from "react";
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

// Define the 10 core virtues for the R.I.G.H.T. framework
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

const FormSchema = z.object({
  priorityVirtues: z.array(z.string()).refine(
    (val) => val.length >= 2 && val.length <= 3,
    "You must select between 2 and 3 priority virtues.",
  ),
});

const PRIORITY_VIRTUES_KEY = "priorityVirtues";
const CUSTOM_VIRTUES_KEY = "customVirtues";

const Settings = () => {
  const navigate = useNavigate();
  const [customVirtueInput, setCustomVirtueInput] = React.useState("");
  const [allVirtues, setAllVirtues] = React.useState(predefinedVirtues);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      priorityVirtues: [],
    },
  });

  // Load existing virtues and custom virtues from localStorage on component mount
  React.useEffect(() => {
    const storedPriorityVirtues = localStorage.getItem(PRIORITY_VIRTUES_KEY);
    if (storedPriorityVirtues) {
      form.reset({ priorityVirtues: JSON.parse(storedPriorityVirtues) });
    }

    const storedCustomVirtues = localStorage.getItem(CUSTOM_VIRTUES_KEY);
    if (storedCustomVirtues) {
      const parsedCustomVirtues = JSON.parse(storedCustomVirtues).map((v: string) => ({ id: v.toLowerCase().replace(/\s/g, '-'), label: v }));
      setAllVirtues([...predefinedVirtues, ...parsedCustomVirtues]);
    }
  }, [form]);

  // Update allVirtues when custom virtues change
  React.useEffect(() => {
    const storedCustomVirtues = localStorage.getItem(CUSTOM_VIRTUES_KEY);
    const parsedCustomVirtues = storedCustomVirtues ? JSON.parse(storedCustomVirtues).map((v: string) => ({ id: v.toLowerCase().replace(/\s/g, '-'), label: v })) : [];
    setAllVirtues([...predefinedVirtues, ...parsedCustomVirtues]);
  }, [localStorage.getItem(CUSTOM_VIRTUES_KEY)]); // Re-run when custom virtues in localStorage change

  const handleAddCustomVirtue = () => {
    const trimmedInput = customVirtueInput.trim();
    if (trimmedInput && !allVirtues.some(v => v.label.toLowerCase() === trimmedInput.toLowerCase())) {
      const newCustomVirtue = { id: trimmedInput.toLowerCase().replace(/\s/g, '-'), label: trimmedInput };
      const updatedCustomVirtues = [...(JSON.parse(localStorage.getItem(CUSTOM_VIRTUES_KEY) || "[]")), trimmedInput];
      localStorage.setItem(CUSTOM_VIRTUES_KEY, JSON.stringify(updatedCustomVirtues));
      setCustomVirtueInput("");
      toast.success(`Custom virtue "${trimmedInput}" added!`);
      // Re-fetch all virtues to include the new one
      const storedCustomVirtues = localStorage.getItem(CUSTOM_VIRTUES_KEY);
      const parsedCustomVirtues = storedCustomVirtues ? JSON.parse(storedCustomVirtues).map((v: string) => ({ id: v.toLowerCase().replace(/\s/g, '-'), label: v })) : [];
      setAllVirtues([...predefinedVirtues, ...parsedCustomVirtues]);
    } else if (trimmedInput) {
      toast.error("Virtue already exists or is empty.");
    }
  };

  const handleRemoveCustomVirtue = (virtueId: string) => {
    const updatedCustomVirtues = JSON.parse(localStorage.getItem(CUSTOM_VIRTUES_KEY) || "[]").filter((v: string) => v.toLowerCase().replace(/\s/g, '-') !== virtueId);
    localStorage.setItem(CUSTOM_VIRTUES_KEY, JSON.stringify(updatedCustomVirtues));
    toast.success("Custom virtue removed.");

    // Also remove from selected priority virtues if it was selected
    const currentPriorityVirtues = form.getValues("priorityVirtues");
    const updatedPriorityVirtues = currentPriorityVirtues.filter(id => id !== virtueId);
    form.setValue("priorityVirtues", updatedPriorityVirtues);

    // Re-fetch all virtues to reflect removal
    const storedCustomVirtues = localStorage.getItem(CUSTOM_VIRTUES_KEY);
    const parsedCustomVirtues = storedCustomVirtues ? JSON.parse(storedCustomVirtues).map((v: string) => ({ id: v.toLowerCase().replace(/\s/g, '-'), label: v })) : [];
    setAllVirtues([...predefinedVirtues, ...parsedCustomVirtues]);
  };

  function onSubmit(data: z.infer<typeof FormSchema>) {
    localStorage.setItem(PRIORITY_VIRTUES_KEY, JSON.stringify(data.priorityVirtues));
    toast.success("Priority virtues updated!", {
      description: `You've adjusted to: ${data.priorityVirtues.map(v => allVirtues.find(virt => virt.id === v)?.label).join(", ")}`,
    });
    navigate("/dashboard"); // Go back to dashboard after updating
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
                render={({ field }) => (
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
                          render={({ field: innerField }) => {
                            const isCustom = !predefinedVirtues.some(v => v.id === item.id);
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={innerField.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      const newValue = checked
                                        ? [...innerField.value, item.id]
                                        : innerField.value?.filter(
                                            (value) => value !== item.id,
                                          );
                                      innerField.onChange(newValue);
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
                                      handleRemoveCustomVirtue(item.id);
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