
"use client";

import * as React from 'react';
import { PageTitle } from '@/components/shared/page-title';
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, CalendarDays, User, Clock, LogIn, LogOut, Users, AlertCircle } from 'lucide-react';
import { getDailyAttendanceDetails, type DailyAttendanceDetail } from '@/services/attendance-service';
import { format, parseISO } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function AdminAttendanceCalendarPage() {
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [dailyAttendance, setDailyAttendance] = React.useState<DailyAttendanceDetail[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (selectedDate) {
      const fetchAttendance = async () => {
        setIsLoading(true);
        setDailyAttendance([]);
        try {
          const dateString = format(selectedDate, 'yyyy-MM-dd');
          const details = await getDailyAttendanceDetails(dateString);
          setDailyAttendance(details);
        } catch (error) {
          console.error("Failed to fetch daily attendance:", error);
          toast({
            title: "Error",
            description: "Could not load attendance records for the selected date.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      };
      fetchAttendance();
    }
  }, [selectedDate, toast]);

  return (
    <>
      <PageTitle
        title="Daily Attendance Log"
        description="Select a date on the calendar to view attendance records for that day."
      />

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        <Card className="lg:col-span-1 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarDays className="mr-2 h-5 w-5 text-primary" />
              Select Date
            </CardTitle>
            <CardDescription>Choose a day to view its attendance.</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border shadow-inner"
              modifiers={{ today: new Date() }}
              modifiersStyles={{ today: { color: 'hsl(var(--accent-foreground))', backgroundColor: 'hsl(var(--accent))' } }}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="mr-2 h-5 w-5 text-primary" />
              Attendance for {selectedDate ? format(selectedDate, 'PPP') : '...'}
            </CardTitle>
            <CardDescription>
              List of students who checked in on the selected date.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-2 text-muted-foreground">Loading attendance...</p>
              </div>
            ) : dailyAttendance.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <AlertCircle className="mx-auto mb-2 h-10 w-10 text-muted-foreground/70" />
                No attendance records found for {selectedDate ? format(selectedDate, 'PPP') : 'the selected date'}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Seat</TableHead>
                      <TableHead>Shift</TableHead>
                      <TableHead className="text-center">Check-In</TableHead>
                      <TableHead className="text-center">Check-Out</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dailyAttendance.map((record) => (
                      <TableRow key={record.recordId}>
                        <TableCell className="font-medium">{record.studentName}</TableCell>
                        <TableCell>{record.seatNumber || 'N/A'}</TableCell>
                        <TableCell className="capitalize">{record.shift}</TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          <div className="flex items-center justify-center">
                            <LogIn className="mr-1 h-4 w-4 text-green-600" />
                            {format(parseISO(record.checkInTime), 'p')}
                          </div>
                        </TableCell>
                        <TableCell className="text-center whitespace-nowrap">
                          {record.checkOutTime ? (
                            <div className="flex items-center justify-center">
                              <LogOut className="mr-1 h-4 w-4 text-red-600" />
                              {format(parseISO(record.checkOutTime), 'p')}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center text-yellow-600">
                              <Clock className="mr-1 h-4 w-4" />
                              <span>Active</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
