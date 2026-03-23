import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import BookClassButton from "./BookClassButton";

export default async function MemberClassesPage(props: { searchParams: Promise<{ success?: string }> }) {
    const searchParams = await props.searchParams;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) redirect("/login");

    const user = await prisma.user.findUnique({
        where: { id: session.user.id }
    });

    const classes = await prisma.class.findMany({
        where: { gymBranchId: user?.gymBranchId || undefined, date: { gte: new Date() } },
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
            {searchParams.success && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm uppercase tracking-widest font-bold flex items-center justify-between">
                    <span>✅ Booking Confirmed</span>
                    <a href="/dashboard/classes" className="text-white hover:text-green-400">✕</a>
                </div>
            )}

            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-display uppercase tracking-wider text-white mb-2">Class Enrollments</h1>
                    <p className="text-white/40 font-sans text-sm">Secure your position in upcoming athlete sessions.</p>
                </div>
            </div>

            <div className="space-y-6">
                {Object.entries(scheduleGroups).length === 0 ? (
                    <div className="glass rounded-2xl border border-white/[0.05] h-64 flex items-center justify-center">
                        <p className="text-white/30 font-sans text-sm">No upcoming classes available at your branch.</p>
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
                                    const confirmedBookings = cls.bookings.filter(b => b.status === "CONFIRMED");
                                    const enrolled = confirmedBookings.length;
                                    const isFull = enrolled >= cls.maxSeats;
                                    const isBooked = confirmedBookings.some(b => b.userId === session?.user?.id);

                                    return (
                                        <div key={cls.id} className="p-4 flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                                            <div className="flex items-center gap-6">
                                                <div className="text-xs font-mono text-white/40 w-24 flex-shrink-0">{format(new Date(cls.date), 'hh:mm a')}</div>
                                                <div>
                                                    <div className="text-sm text-white font-medium flex items-center gap-2">
                                                        {cls.name}
                                                        {cls.price > 0
                                                            ? <span className="text-[10px] text-accent-gold border border-accent-gold/30 px-1 rounded">${cls.price.toFixed(2)}</span>
                                                            : <span className="text-[10px] text-green-400 border border-green-400/30 px-1 rounded uppercase">Free</span>
                                                        }
                                                    </div>
                                                    <div className="text-xs text-white/40">Coach {cls.trainer}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="hidden md:block text-right">
                                                    <div className="text-xs text-white/60 mb-1">{enrolled}/{cls.maxSeats} enrolled</div>
                                                </div>
                                                <BookClassButton classId={cls.id} isBooked={isBooked} isFull={isFull} />
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
