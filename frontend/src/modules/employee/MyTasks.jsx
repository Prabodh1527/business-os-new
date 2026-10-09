import { useCallback, useEffect, useState } from "react";
import {
  PlusCircle,
  Trash2,
  ListTodo,
  CheckSquare,
  Square,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { createTask, deleteTask, fetchTasks, updateTask } from "@/api/tasks.api";

export default function MyTasks() {
  const { token, user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    dueDate: new Date().toISOString().slice(0, 10),
    priority: "Medium",
    category: "Operations",
  });

  const loadTasks = useCallback(async () => {
    if (!token) return;
    try {
      setError("");
      const response = await fetchTasks(token);
      setTasks(response.tasks || response.data || []);
    } catch (loadError) {
      setError(loadError.message || "Unable to load assigned tasks.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const toggleTaskStatus = async (task) => {
    const nextStatus = task.status === "Completed" ? "Pending" : "Completed";
    try {
      setError("");
      await updateTask(task._id, { status: nextStatus }, token);
      await loadTasks();
    } catch (updateError) {
      setError(updateError.message || "Unable to update task.");
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      setError("");
      await deleteTask(id, token);
      await loadTasks();
    } catch (deleteError) {
      setError(deleteError.message || "Unable to delete task.");
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      await createTask({
        title: newTask.title.trim(),
        dueDate: newTask.dueDate,
        priority: newTask.priority,
        assignedTo: user?.name || "",
        assignedToEmail: user?.email || "",
      }, token);
      setShowAddModal(false);
      setNewTask({
        title: "",
        dueDate: new Date().toISOString().slice(0, 10),
        priority: "Medium",
        category: "Operations",
      });
      await loadTasks();
    } catch (createError) {
      setError(createError.message || "Unable to create task.");
    } finally {
      setSubmitting(false);
    }
  };

  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.status === "Completed").length;
  const pendingCount = totalCount - completedCount;
  const highPriorityCount = tasks.filter((t) => t.priority === "High" && t.status !== "Completed").length;

  const filteredTasks = tasks.filter((task) => {
    if (filter === "ALL") return true;
    return filter === "Pending" ? task.status !== "Completed" : task.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            My Tasks & Checklist
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Track your daily assignments, workplace checklists, and operational to-dos.
          </p>
        </div>

        {error && <p role="alert" className="rounded-xl border border-rose-500/30 bg-rose-950/30 p-3 text-sm text-rose-300">{error}</p>}

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-emerald-500 transition shadow-md shadow-emerald-950/30 self-start sm:self-auto"
        >
          <PlusCircle size={16} />
          <span>Add Personal Task</span>
        </button>
      </div>

      {/* Task Metrics Bar */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <p className="text-xs text-slate-400">Total Tasks</p>
          <p className="text-2xl font-bold text-white mt-1">{totalCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <p className="text-xs text-slate-400">Pending Execution</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <p className="text-xs text-slate-400">Completed</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{completedCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4">
          <p className="text-xs text-slate-400">High Priority Active</p>
          <p className="text-2xl font-bold text-rose-400 mt-1">{highPriorityCount}</p>
        </div>
      </div>

      {/* Main Task List Card */}
      <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <ListTodo size={20} className="text-emerald-400" />
            <h2 className="text-lg font-semibold text-white">Task Items</h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2">
            {["ALL", "Pending", "Completed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition ${
                  filter === f
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {loading ? <p className="py-8 text-center text-sm text-slate-400">Loading tasks…</p> : filteredTasks.map((task) => {
            const isCompleted = task.status === "Completed";

            return (
              <div
                key={task.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 transition-all ${
                  isCompleted
                    ? "border-slate-800/60 bg-slate-950/40 opacity-70"
                    : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    onClick={() => toggleTaskStatus(task)}
                    className={`mt-0.5 rounded-lg p-1 transition ${
                      isCompleted ? "text-emerald-400" : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {isCompleted ? <CheckSquare size={20} /> : <Square size={20} />}
                  </button>

                  <div>
                    <h3
                      className={`text-sm font-semibold transition ${
                        isCompleted ? "line-through text-slate-500" : "text-white"
                      }`}
                    >
                      {task.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      📅 Due: {task.dueDate || "Not set"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 self-start sm:self-auto pl-8 sm:pl-0">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      task.priority === "High"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : task.priority === "Medium"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    }`}
                  >
                    {task.priority} Priority
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      isCompleted
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-indigo-500/10 text-indigo-400"
                    }`}
                  >
                    {task.status}
                  </span>

                  {task.createdByUserId === user?._id && <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 transition"
                    title="Delete task"
                  >
                    <Trash2 size={15} />
                  </button>}
                </div>
              </div>
            );
          })}
          {!loading && filteredTasks.length === 0 && <p className="py-8 text-center text-sm text-slate-500">No tasks in this view.</p>}
        </div>
      </div>

      {/* Add Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white">Create Personal Task</h3>
            <p className="text-xs text-slate-400 mt-1">
              Add a checklist item to your personal queue for this shift.
            </p>

            <form onSubmit={handleCreateTask} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-300">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="e.g. Restock service station supplies"
                  className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-300">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-300">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none"
                  >
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-500 transition"
                >
                  {submitting ? "Saving..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
