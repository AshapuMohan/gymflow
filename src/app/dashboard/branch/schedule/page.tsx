import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import AddClassForm from "./AddClassForm";

export default async function BranchSchedulePage() {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "GYMADMIN" && session?.user?.role !== "SUPERADMIN") redirect("/dashboard");

    const classes = await prisma.class.findMany({
        where: { gymBranchId: session.user.gymBranchId || undefined, date: { gte: new Date() } },
        orderBy: { date: 'asc' },
        include: { bookings: true }
    });

    // Group by Date formatted 'EEEE, MMM do'
    const scheduleGroups: Record<string, typeof classes> = {};
    classes.forEach(c => {
        const day = format(new Date(c.date), 'EEEE, MMM do');
        if (!scheduleGroups[day]) scheduleGroups[day] = [];
        scheduleGroups[day].push(c);
    });

    return (
        <div className="w-full">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-display uppercase tracking-wider text-white mb-2">Class Schedule</h1>
                    <p className="text-white/40 font-sans text-sm">Weekly training program management.</p>
                </div>
                <AddClassForm />
            </div>

            <div className="space-y-6">
                {Object.entries(scheduleGroups).length === 0 ? (
                    <div className="glass rounded-2xl border border-white/[0.05] h-64 flex items-center justify-center">
                        <p className="text-white/30 font-sans text-sm">No upcoming classes scheduled.</p>
                    </div>
                ) : (
                    Object.entries(scheduleGroups).map(([day, dayClasses]) => (
                        <div key={day} className="glass rounded-2xl border border-white/[0.05] overflow-hidden">
                            <div className="px-6 py-4 border-b border-white/[0.05] bg-white/[0.02] flex justify-between items-center">
                                <h2 className="text-xs uppercase tracking-[0.2em] text-white font-bold">{day}</h2>
                                <span className="text-white/30 text-[10px] uppercase font-bold tracking-widest">{dayClasses.length} {dayClasses.length === 1 ? 'Class' : 'Classes'}</span>
                            </div>
                            <div className="divide-y divide-white/[0.03]">
                                {dayClasses.map((cls) => {
                                    const enrolled = cls.bookings.filter(b => b.status === "CONFIRMED").length;
                                    const fillPct = Math.round((enrolled / cls.maxSeats) * 100);
                                    const isFull = enrolled >= cls.maxSeats;
                                    return (
                                        <div key={cls.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors group">
                                            <div className="flex items-center gap-6">
                                                <div className="text-xs font-mono text-white/40 w-24 flex-shrink-0">{format(new Date(cls.date), 'hh:mm a')}</div>
                                                <div>
                                                    <div className="text-sm text-white font-medium flex items-center gap-2">
                                                        {cls.name}
                                                        {cls.price > 0 && <span className="text-[10px] text-accent-gold border border-accent-gold/30 px-1 rounded">${cls.price.toFixed(2)}</span>}
                                                    </div>
                                                    <div className="text-xs text-white/40">Coach {cls.trainer}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="hidden md:block text-right">
                                                    <div className="text-xs text-white/60 mb-1">{enrolled}/{cls.maxSeats} enrolled</div>
                                                    <div className="w-24 h-1 bg-white/10 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full transition-all ${isFull ? 'bg-red-500' : 'bg-accent-gold'}`} style={{ width: `${Math.min(fillPct, 100)}%` }} />
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] uppercase px-2 py-1 rounded font-bold ${isFull ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                                                    {isFull ? 'Full' : 'Open'}
                                                </span>
                                                <button className="text-xs text-white/40 hover:text-accent-gold opacity-0 group-hover:opacity-100 transition-all">Cancel</button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
