"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { CheckCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PhoneInput } from "@/components/ui/phone-iput";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

// Form validation schema
const formSchema = z.object({
  firstName: z.string().min(1, "This field is required."),
  lastName: z.string().min(1, "This field is required."),
  middleName: z.string().optional(),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  affiliation: z.string().min(1, "This field is required."),
  position: z.string().min(1, "This field is required."),
  phone: z.string().optional(),
  type: z.enum(["1", "2"], {
    message: "You need to select a type.",
  }),
  haveVisa: z.enum(["0", "1"], {
    message: "You need to select a visa type.",
  }),
  dietaryRequirements: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message: "You have to select at least one item.",
    }),
  paperNumber: z.string().optional(),
  otherExplain: z.string().optional(),
});
export function FormPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      affiliation: "",
      position: "",
      email: "",
      phone: "",
      type: undefined,
      paperNumber: "",
      haveVisa: undefined,
      dietaryRequirements: [],
      otherExplain: "",
    },
  });

  // 监听表单值的变化
  const type = form.watch("type");
  const dietaryRequirements = form.watch("dietaryRequirements");
  // Form submission handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    const dietaryLabels = values.dietaryRequirements
      .map((id) => {
        const item = items.find((i) => i.id === id);
        return item ? item.label : "";
      })
      .filter((label) => label);

    let dietaryString = dietaryLabels.join(", ");
    if (values.dietaryRequirements.includes("5") && values.otherExplain) {
      dietaryString = dietaryString.replace(
        "Other",
        `Other: ${values.otherExplain}`
      );
    }

    const dataToSend = {
      first_name: values.firstName,
      middle_name: values?.middleName || "",
      last_name: values.lastName,
      email: values.email,
      phone: values.phone,
      affiliation: values.affiliation,
      position: values.position,
      type: Number(values.type),
      paper_number: values.paperNumber,
      have_visa: Number(values.haveVisa),
      dietary_requirements: dietaryString,
      other_explain: values.otherExplain,
    };

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        console.error("Submission failed");
        // You might want to show an error message to the user here
        return;
      }

      const result = await response.json();
      const customerId = result.id;

      setIsSubmitted(true);
      window.location.href = `${
        process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK as string
      }?client_reference_id=${customerId}&prefilled_email=${values.email}`;
    } catch (error) {
      console.error("An error occurred:", error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  }

  const items = [
    {
      id: "0",
      label: "No",
    },
    {
      id: "1",
      label: "Vegetarian",
    },
    {
      id: "2",
      label: "Vegan",
    },
    {
      id: "3",
      label: "Halal",
    },
    {
      id: "4",
      label: "Dairy free",
    },
    {
      id: "5",
      label: "Other",
    },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {isSubmitted ? (
          <SuccessMessage />
        ) : (
          <Card className="bg-white shadow-lg border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold text-slate-800 text-center">
                The 18th International Conference on Provable and Practical
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="First name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="middleName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder="Middle name (optional)"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input placeholder="Last name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="affiliation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Affiliation (Organisation/University/Company)
                          </FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your position"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title or Academic Position</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your position"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="your.email@example.com"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      rules={{
                        validate: (value) =>
                          isValidPhoneNumber(value || "", "AU"),
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone (optional)</FormLabel>
                          <FormControl className="w-full">
                            <PhoneInput
                              placeholder="Placeholder"
                              {...field}
                              defaultCountry="AU"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid md:grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>
                            Registration Type (Each paper needs at least one
                            registration from one author)
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="1" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Author
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="2" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Non-Author
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {type === "1" && (
                    <div className="grid md:grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="paperNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Paper number</FormLabel>
                            <FormControl>
                              <Input type="text" {...field} />
                            </FormControl>
                            <FormDescription>
                              For Author registration
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  <div className="grid md:grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="haveVisa"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>
                            Do you need an invitation letter to apply for an
                            Australian Visa?
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="1" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Yes
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="0" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  No
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid md:grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="dietaryRequirements"
                      render={() => (
                        <FormItem>
                          <div className="mb-4">
                            <FormLabel className="text-base">
                              Dietary requirements
                            </FormLabel>
                          </div>
                          {items.map((item) => (
                            <FormField
                              key={item.id}
                              control={form.control}
                              name="dietaryRequirements"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                item.id,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              );
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />
                          ))}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {dietaryRequirements.includes("5") && (
                    <div className="grid md:grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="otherExplain"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Other</FormLabel>
                            <FormControl>
                              <Input type="text" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  <div className="text-center space-y-2 mb-6">
                    <div className="text-slate-700">
                      ProvSec 2024 Registration Fee (Including Tax and
                      Transaction Fee)
                    </div>
                    <div className="text-2xl font-bold">AU$1,350.00</div>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Submitting..." : "Submit and Pay"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SuccessMessage() {
  return (
    <Card className="bg-white shadow-lg border-slate-200 text-center p-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-4">
        Submission Successful
      </h2>
      <p className="text-slate-600 mb-8">
        Thank you for your submission. Our team will contact you shortly to
        provide professional security service consultation.
      </p>
      <Button
        onClick={() => window.location.reload()}
        variant="outline"
        className="mx-auto"
      >
        Return to Form
      </Button>
    </Card>
  );
}
