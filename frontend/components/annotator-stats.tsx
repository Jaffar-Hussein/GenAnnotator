import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { fetchUsersStats } from "@/services/api";

const AnnotatorStats = ({ username, reloadTrigger }) => {
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

        const formattedStats = {
          name: username,
          totalAssigned: response.data.annotations,
          pending: response.data.pending.count,
          approved: response.data.approved.count,
          rejected: response.data.rejected.count,
          ongoing: response.data.ongoing.count,
          recentAssignments,
        };

        setStats(formattedStats);
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
    return <div className="p-4 text-center">Loading statistics...</div>;
  }

  if (error || !stats) {
    return (
      <div className="p-4 text-center text-red-500">
        {error || "Failed to load statistics"}
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-4">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium text-sm text-indigo-900">
            {stats.name}'s Statistics
          </h4>
          <div className="flex items-center gap-2">
            {stats.totalAssigned > 0 ? (
              <>
                <Progress
                  value={(stats.approved / stats.totalAssigned) * 100}
                  className="w-24 bg-indigo-200"
                />
                <motion.span
                  key={stats.approved}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-indigo-700"
                >
                  {Math.round((stats.approved / stats.totalAssigned) * 100)}%
                  approval
                </motion.span>
              </>
            ) : (
              <span className="text-sm text-slate-500">No assignments yet</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-yellow-500" />
            <div>
              <motion.div
                key={stats.ongoing + stats.pending}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-semibold text-indigo-900"
              >
                {stats.ongoing + stats.pending || 0}
              </motion.div>
              <div className="text-xs text-indigo-600">Pending</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <div>
              <motion.div
                key={stats.approved}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-semibold text-indigo-900"
              >
                {stats.approved || 0}
              </motion.div>
              <div className="text-xs text-indigo-600">Approved</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <div>
              <motion.div
                key={stats.rejected}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: 1 }}
                className="text-2xl font-semibold text-indigo-900"
              >
                {stats.rejected || 0}
              </motion.div>
              <div className="text-xs text-indigo-600">Rejected</div>
            </div>
          </div>
        </div>

        <div>
          <h5 className="text-sm font-medium text-indigo-900 mb-2">
            Recent Activity
          </h5>
          <div className="space-y-2">
            {stats.recentAssignments.length > 0 ? (
              stats.recentAssignments.map((assignment, index) => (
                <div
                  key={`${assignment.date}-${assignment.status}-${assignment.count}`}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    {assignment.status === "PENDING" && (
                      <Clock className="h-3 w-3 text-yellow-500" />
                    )}
                    {assignment.status === "APPROVED" && (
                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                    )}
                    {assignment.status === "REJECTED" && (
                      <XCircle className="h-3 w-3 text-red-500" />
                    )}
                    <span className="text-indigo-700">
                      {new Date(assignment.date).toLocaleDateString()}
                    </span>
                  </div>
                  <motion.span
                    key={assignment.count}
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: 1 }}
                    className="font-medium text-indigo-900"
                  >
                    {assignment.count} genes
                  </motion.span>
                </div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-6 bg-slate-100 dark:bg-slate-700 rounded-lg"
              >
                <div className="text-slate-500 dark:text-slate-400">
                  <Clock className="h-5 w-5 mx-auto mb-2 opacity-50" />
                  <p>No recent activity yet</p>
                  <p className="text-xs mt-1 text-slate-400 dark:text-slate-500">
                    New assignments will appear here
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnotatorStats;
