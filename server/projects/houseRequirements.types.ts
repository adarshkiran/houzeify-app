// ─── House Requirements DTOs — 12H-C ────────────────────────────────────────

import type { HouseRequirementsRow } from '../db/schema.js'

export function serializeHouseRequirements(row: HouseRequirementsRow) {
  return {
    id: row.id,
    projectId: row.projectId,
    buildingType: row.buildingType,
    plotArea: row.plotArea,
    plotDimensions: row.plotDimensions,
    siteConditions: row.siteConditions,
    builtUpArea: row.builtUpArea,
    floors: row.floors,
    bhk: row.bhk,
    bedrooms: row.bedrooms,
    bathrooms: row.bathrooms,
    hasLivingRoom: row.hasLivingRoom,
    hasDiningArea: row.hasDiningArea,
    hasKitchen: row.hasKitchen,
    hasUtilityArea: row.hasUtilityArea,
    hasBalcony: row.hasBalcony,
    hasStaircase: row.hasStaircase,
    hasTerrace: row.hasTerrace,
    parking: row.parking,
    finishLevel: row.finishLevel,
    specialRequirements: row.specialRequirements ?? [],
    budgetExpected: row.budgetExpected,
    budgetMin: row.budgetMin,
    budgetMax: row.budgetMax,
    timelineStart: row.timelineStart,
    timelineCompletion: row.timelineCompletion,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  }
}
