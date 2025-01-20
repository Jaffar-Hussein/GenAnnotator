import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, XCircle, Activity, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { fetchUsersStats } from "@/services/api";
import { capitalizeWord } from "@/lib/utils";

const StatCard = ({ icon: Icon, label, value, color, animate = true }) => (
  <div className="flex items-center gap-3 bg-white dark:bg-gray-800/50 p-3 rounded-lg border border-slate-200/60 dark:border-gray-700/60">
    <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center`}>
      <Icon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
    </div>
    <div>
      {animate ? (
        <motion.div
          key={value}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-semibold text-slate-900 dark:text-white"
        >
          {value || 0}
        </motion.div>
      ) : (
        <div className="text-2xl font-semibold text-slate-900 dark:text-white">
          {value || 0}
        </div>
      )}
      <div className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  </div>
);

const AnnotatorStats = ({ username, reloadTrigger, first_name, last_name }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetchUsersStats({ username });
        if (response.error || !response.data) {
          throw new Error(response.error || "No data received");
        }

        const recentAssignments = Object.entries({
          ongoing: response.data.ongoing,
          pending: response.data.pending,
          approved: response.data.approved,
          rejected: response.data.rejected,
        })
          .filter(([_, data]) => data.count > 0)
          .map(([status, data]) => ({
            date: new Date().toISOString().split("T")[0],
            count: data.count,
            status: status.toUpperCase(),
          }));

        setStats({
          name: username,
          totalAssigned: response.data.annotations,
          pending: response.data.pending.count,
          approved: response.data.approved.count,
          rejected: response.data.rejected.count,
          ongoing: response.data.ongoing.count,
          recentAssignments,
        });
      } catch (err) {
        setError("Failed to fetch annotator statistics");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchStats();
    }
  }, [username, reloadTrigger]);

  if (loading && !stats) {
    return (
      <div className="p-8 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 dark:bg-gray-700 rounded-lg w-1/3 mx-auto"></div>
          <div className="h-24 bg-slate-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-32 bg-slate-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-8 text-center rounded-lg border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-900/20">
        <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
        <p className="text-rose-600 dark:text-rose-400 font-medium">
          {error || "Failed to load statistics"}
        </p>
      </div>
    );
  }

  const approvalRate = stats.totalAssigned > 0
    ? Math.round((stats.approved / stats.totalAssigned) * 100)
    : 0;

  return (
    <div className="space-y-6 p-6 bg-slate-50 dark:bg-gray-800/50 rounded-xl border border-slate-200/60 dark:border-gray-700/60">
      {/* Header with Approval Rate */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h4 className="font-medium text-slate-900 dark:text-white">
            Performance Overview
          </h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Statistics for {capitalizeWord(first_name)} {capitalizeWord(last_name)}
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-gray-800 p-2 px-4 rounded-lg border border-slate-200/60 dark:border-gray-700/60">
          <div className="flex flex-col items-end">
            <motion.div
              key={approvalRate}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              {approvalRate}%
            </motion.div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Approval Rate</div>
          </div>
          <Progress
            value={approvalRate}
            className="w-24 h-2 bg-slate-200 dark:bg-gray-700"
          />
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={Clock}
          label="Pending"
          value={stats.ongoing + stats.pending}
          color="bg-amber-100 dark:bg-amber-900/30"
        />
        <StatCard
          icon={CheckCircle2}
          label="Approved"
          value={stats.approved}
          color="bg-emerald-100 dark:bg-emerald-900/30"
        />
        <StatCard
          icon={XCircle}
          label="Rejected"
          value={stats.rejected}
          color="bg-rose-100 dark:bg-rose-900/30"
        />
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-slate-400" />
            Recent Activity
          </h5>
        </div>
        
        <div className="space-y-2">
          <AnimatePresence mode="wait">
            {stats.recentAssignments.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-2"
              >
                {stats.recentAssignments.map((assignment, index) => (
                  <motion.div
                    key={`${assignment.date}-${assignment.status}-${assignment.count}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-800/50 border border-slate-200/60 dark:border-gray-700/60"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                        assignment.status === "PENDING" ? "bg-amber-100 dark:bg-amber-900/30" :
                        assignment.status === "APPROVED" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                        "bg-rose-100 dark:bg-rose-900/30"
                      }`}>
                        {assignment.status === "PENDING" && <Clock className="h-4 w-4 text-amber-700 dark:text-amber-300" />}
                        {assignment.status === "APPROVED" && <CheckCircle2 className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />}
                        {assignment.status === "REJECTED" && <XCircle className="h-4 w-4 text-rose-700 dark:text-rose-300" />}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {assignment.count} genes {assignment.status.toLowerCase()}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(assignment.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                      assignment.status === "PENDING" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" :
                      assignment.status === "APPROVED" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" :
                      "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                    }`}>
                      {assignment.status}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 text-center bg-white dark:bg-gray-800 rounded-lg border border-dashed border-slate-200 dark:border-gray-700"
              >
                <Activity className="h-8 w-8 text-slate-400 dark:text-slate-500 mx-auto mb-2" />
                <p className="text-slate-600 dark:text-slate-400 font-medium">No recent activity</p>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                  New assignments will appear here
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AnnotatorStats;