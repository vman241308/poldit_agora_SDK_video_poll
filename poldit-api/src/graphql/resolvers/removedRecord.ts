import { ResolverMap } from "../../interfaces";

import RemovedRecord from "../../models/removedRecordsModel";
import IRemovedRecord from "../../models/interfaces/removedRecords";

export const removedRecordResolvers: ResolverMap = {
  Query: {
    removedRecords: async (_, __, obj) => {
      try {
        const removedRecords: IRemovedRecord[] = await RemovedRecord.find();
        return removedRecords;
      } catch (err) {
        throw err;
      }
    },
    removedRecord: async (_, { recordId }, ctx) => {
      try {
        const removedRecord: IRemovedRecord = await RemovedRecord.findById(
          recordId
        );

        return removedRecord;
      } catch (err) {
        throw err;
      }
    },
  },
  Mutation: {
    createRemovedRecord: async (
      _,
      { removalType, content, removalDate },
      ctx
    ) => {
      const removedRecord: IRemovedRecord = new RemovedRecord({
        removalType,
        content,
        removalDate,
      });
      const savedRemovedRecord = await removedRecord.save();
      return savedRemovedRecord;
    },
    deleteRemovedRecord: async (_, { recordId }, ctx) => {
      try {
        await RemovedRecord.findByIdAndDelete(recordId);
        return "Removed Record Deleted Succfully";
      } catch (err) {
        throw err;
      }
    },
  },
};
