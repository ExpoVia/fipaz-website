"use client";

import { useCallback } from "react";

import { useAsyncResource } from "@/hooks/use-async-resource";
import { activitiesService } from "../activities.service";
import type { Activity, AttendanceRecord, AttendanceUpdate } from "../types";

interface AttendanceData {
  activity: Activity;
  records: AttendanceRecord[];
}

/** Actividad y lista de participantes, con las tres operaciones de asistencia. */
export function useAttendance(activityId: string) {
  const { setData, ...resource } = useAsyncResource<AttendanceData>(`attendance:${activityId}`, async () => {
    const [activity, records] = await Promise.all([
      activitiesService.getActivityById(activityId),
      activitiesService.getAttendance(activityId),
    ]);
    return { activity, records };
  });

  const apply = useCallback(
    ({ record, activity }: AttendanceUpdate) =>
      setData((current) => ({
        activity,
        records: current.records.map((item) => (item.id === record.id ? record : item)),
      })),
    [setData],
  );

  const confirm = useCallback(
    async (participantId: string) => {
      const update = await activitiesService.markAttendance(activityId, participantId);
      apply(update);
      return update.record;
    },
    [activityId, apply],
  );

  const markAbsent = useCallback(
    async (participantId: string) => {
      const update = await activitiesService.markAbsent(activityId, participantId);
      apply(update);
      return update.record;
    },
    [activityId, apply],
  );

  const revert = useCallback(
    async (participantId: string) => {
      const update = await activitiesService.revertAttendance(activityId, participantId);
      apply(update);
      return update.record;
    },
    [activityId, apply],
  );

  return { ...resource, confirm, markAbsent, revert };
}
