import { z } from "zod"
import { tool, UIToolInvocation } from "ai"

const itemSchema = z.object({
  description: z.string().describe("Description of the work item"),
  quantity: z.number().describe("Quantity of units"),
  unit: z.string().describe("Unit of measurement (sq ft, each, linear ft, etc)"),
  unitPrice: z.number().describe("Material cost per unit"),
  laborHours: z.number().describe("Estimated labor hours"),
  laborRate: z.number().describe("Labor rate per hour"),
})

export const modifyEstimate = tool({
  description: "Modify the current project estimate. Can add items, remove items, update quantities, or change prices.",
  inputSchema: z.object({
    action: z.enum(["add_item", "remove_item", "update_item", "remove_category", "add_category"]).describe("The type of modification to make"),
    category: z.enum(["roofing", "windows", "gutters", "siding", "doors", "painting", "concrete", "fencing"]).describe("The category to modify"),
    itemIndex: z.number().optional().describe("For update/remove item actions, the index of the item in the category"),
    item: itemSchema.optional().describe("For add/update item actions, the item details"),
    reason: z.string().describe("Brief explanation of why this change is being made"),
  }),
  async execute(params) {
    // This tool returns the modification instructions
    // The frontend will apply the actual changes
    return {
      success: true,
      modification: params,
      message: `${params.action.replace('_', ' ')} in ${params.category}: ${params.reason}`
    }
  }
})

export type ModifyEstimateToolResult = UIToolInvocation<typeof modifyEstimate>
