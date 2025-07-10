"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle } from "lucide-react";

// Form validation schema
const formSchema = z
  .object({
    title: z.enum(["Prof", "A/Prof", "Dr", "Mr", "Ms", "other"], {
      message: "Please select a title.",
    }),
    firstName: z.string().min(1, "This field is required."),
    lastName: z.string().min(1, "This field is required."),
    middleName: z.string().optional(),
    email: z.string().email({
      message: "Please enter a valid email address",
    }),
    affiliation: z.string().min(1, "This field is required."),
    phone: z.string().optional(),
    type: z.enum(["1", "2", "3", "4"], {
      message: "You need to select a type.",
    }),
    dietaryRequirements: z
      .array(z.string())
      .refine((value) => value.some((item) => item), {
        message: "You have to select at least one item.",
      }),
    paperNumber: z.string().optional(),
    otherExplain: z.string().optional(),
    otherTitle: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "1" || data.type === "3") {
        return data.paperNumber && data.paperNumber.trim() !== "";
      }
      return true;
    },
    {
      message: "Field is required.",
      path: ["paperNumber"],
    }
  )
  .refine(
    (data) => {
      if (data.dietaryRequirements.includes("5")) {
        return data.otherExplain && data.otherExplain.trim() !== "";
      }
      return true;
    },
    {
      message: "Please specify your dietary requirement.",
      path: ["otherExplain"],
    }
  )
  .refine(
    (data) => {
      if (data.title === "other") {
        return data.otherTitle && data.otherTitle.trim() !== "";
      }
      return true;
    },
    {
      message: "Field is required.",
      path: ["otherTitle"],
    }
  );
export function FormPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: undefined,
      otherTitle: "",
      firstName: "",
      middleName: "",
      lastName: "",
      affiliation: "",
      email: "",
      phone: "",
      type: undefined,
      paperNumber: "",
      dietaryRequirements: [],
      otherExplain: "",
    },
  });

  // 监听表单值的变化
  const type = form.watch("type");
  const title = form.watch("title");
  const dietaryRequirements = form.watch("dietaryRequirements");
  // Form submission handler
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    // 先打开一个空窗口
    const newWindow = window.open("", "_blank");
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
      title: values.title,
      otherTitle: values.otherTitle,
      first_name: values.firstName,
      middle_name: values?.middleName || "",
      last_name: values.lastName,
      email: values.email,
      affiliation: values.affiliation,
      type: Number(values.type),
      paper_number: values.paperNumber,
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
      // 在新窗口跳转
      if (newWindow) {
        newWindow.location.href = `${getPaymentLink(
          values.type
        )}?client_reference_id=${customerId}&prefilled_email=${values.email}`;
      }
    } catch (error) {
      console.error("An error occurred:", error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  }

  // 价格计算逻辑
  function getCurrentPrice(type: string | undefined) {
    // 澳大利亚东部标准时间（AEST, UTC+10）
    const now = new Date();
    // 获取当前UTC时间，转换为AEST
    const nowAEST = new Date(
      now.getTime() + 10 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60 * 1000
    );
    // 截止时间：2025-08-15 00:00:00 AEST
    const deadlineAEST = new Date(Date.UTC(2025, 7, 14, 14, 0, 0)); // 8月是7，14号14点UTC=15号0点AEST
    let price = 0;
    if (type === "1" || type === "2" || type === "4") {
      price = nowAEST < deadlineAEST ? 1450 : 1600;
    } else if (type === "3") {
      price = nowAEST < deadlineAEST ? 800 : 950;
    }
    return price;
  }

  // 支付链接逻辑
  function getPaymentLink(type: string | undefined) {
    const now = new Date();
    const nowAEST = new Date(
      now.getTime() + 10 * 60 * 60 * 1000 - now.getTimezoneOffset() * 60 * 1000
    );
    const deadlineAEST = new Date(Date.UTC(2025, 7, 14, 14, 0, 0));
    if (type === "1") {
      return nowAEST < deadlineAEST
        ? process.env.NEXT_PUBLIC_STRIPE_PAPER_PAYMENT_LINK1
        : process.env.NEXT_PUBLIC_STRIPE_PAPER_PAYMENT_LINK2;
    } else if (type === "2") {
      return nowAEST < deadlineAEST
        ? process.env.NEXT_PUBLIC_STRIPE_POST_PAYMENT_LINK1
        : process.env.NEXT_PUBLIC_STRIPE_POST_PAYMENT_LINK2;
    } else if (type === "3") {
      return nowAEST < deadlineAEST
        ? process.env.NEXT_PUBLIC_STRIPE_STUDENT_PAYMENT_LINK1
        : process.env.NEXT_PUBLIC_STRIPE_STUDENT_PAYMENT_LINK2;
    } else if (type === "4") {
      return nowAEST < deadlineAEST
        ? process.env.NEXT_PUBLIC_STRIPE_NON_PAYMENT_LINK1
        : process.env.NEXT_PUBLIC_STRIPE_NON_PAYMENT_LINK2;
    }
    return "";
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
                <div className="flex flex-col items-center">
                  <span>
                    The 28th International Symposium on Research in Attacks,
                    Intrusions and Defenses (RAID 2025),
                  </span>
                  <span>19 OCT - 22 OCT 2025, Gold Coast, Australia</span>
                </div>
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
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title</FormLabel>
                          <FormControl>
                            <select
                              {...field}
                              className="block w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={field.value || ""}
                            >
                              <option value="" disabled>
                                Select your title
                              </option>
                              <option value="Prof">Prof</option>
                              <option value="A/Prof">A/Prof</option>
                              <option value="Dr">Dr</option>
                              <option value="Mr">Mr</option>
                              <option value="Ms">Ms</option>
                              <option value="other">other</option>
                            </select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {title === "other" && (
                    <div className="grid md:grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="otherTitle"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="text"
                                {...field}
                                placeholder="please enter your title"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
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
                              placeholder="Enter your affiliation"
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
                  {/* <div className="grid md:grid-cols-1 gap-4">
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
                              placeholder=""
                              {...field}
                              defaultCountry="AU"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div> */}
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
                          {/* 副标题 */}
                          <div className="text-sm text-muted-foreground mb-2">
                            Registration includes access to the full conference,
                            catering, welcome reception, gala dinner, and a day
                            pass to Sea World for the social event.
                          </div>
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
                                  Paper Author Registration
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="2" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Poster Author Registration
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="4" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Regular Registration
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="3" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Student Registraion
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
                            <FormLabel>Paper ID & Title</FormLabel>
                            <FormControl>
                              <Input type="text" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  {type === "2" && (
                    <div className="grid md:grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="paperNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Poster ID & Title (to be entered by the poster
                              author)
                            </FormLabel>
                            <FormControl>
                              <Input type="text" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
                  {type === "3" && (
                    <div className="grid md:grid-cols-1 gap-4">
                      <FormField
                        control={form.control}
                        name="paperNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Student ID</FormLabel>
                            <FormControl>
                              <Input type="text" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}
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
                            <FormLabel>Please specify</FormLabel>
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
                      Raid 2025 Registration Fee (Including Tax and Transaction
                      Fee)
                    </div>
                    <div className="text-2xl font-bold">
                      {type
                        ? `AU$${getCurrentPrice(type).toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            }
                          )}`
                        : "--"}
                    </div>
                    <div className="text-slate-700">
                      Additional tickets for the Cocktail Reception, Gala
                      Dinner, and Sea World Theme Park Day Pass can be purchased
                      at the conference special rate on the next page. (Please
                      click 'View All' on the next page to see all available
                      add-ons. Quantities can be adjusted after items are added
                      to your order.)
                      <br />
                      For conference inquiries, please contact{" "}
                      <a style={{ color: "blue" }}>
                        raid25.general.chairs@gmail.com
                      </a>
                      .
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full cursor-pointer"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Next"}
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
      <p className="text-slate-600 mb-8">Thank you for your submission.</p>
    </Card>
  );
}
