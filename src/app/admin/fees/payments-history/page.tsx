
"use client";

import * as React from 'react';
import { PageTitle } from '@/components/shared/page-title';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { History, ListChecks, CreditCard, Loader2, User, Calendar, IndianRupee } from 'lucide-react';
import { getAllStudents } from '@/services/student-service';
import type { Student, PaymentRecord } from '@/types/student';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isValid } from 'date-fns';

interface AggregatedPaymentRecord extends PaymentRecord {
  studentId: string;
  studentName: string;
}

const PaymentHistoryCardItem = ({ payment }: { payment: AggregatedPaymentRecord }) => (
  <Card className="w-full shadow-md">
    <CardHeader className="pb-2">
      <div className="flex justify-between items-center">
        <CardTitle className="text-md break-words">{payment.studentName}</CardTitle>
        <Badge variant="secondary" className="capitalize text-xs px-1.5 py-0.5">
          <CreditCard className="mr-1 h-3 w-3"/>
          {payment.method}
        </Badge>
      </div>
      <CardDescription className="text-xs break-words">Student ID: {payment.studentId} | Payment ID: {payment.paymentId}</CardDescription>
    </CardHeader>
    <CardContent className="text-xs space-y-1 pb-3">
      <p><span className="font-medium">Date:</span> {payment.date && isValid(parseISO(payment.date)) ? format(parseISO(payment.date), 'MMM d, yyyy') : 'N/A'}</p>
      <p><span className="font-medium">Amount:</span> {payment.amount}</p>
      <p><span className="font-medium">Transaction ID:</span> {payment.transactionId}</p>
    </CardContent>
  </Card>
);


export default function PaymentHistoryPage() {
  const { toast } = useToast();
  const [allPayments, setAllPayments] = React.useState<AggregatedPaymentRecord[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchPaymentHistory = async () => {
      setIsLoading(true);
      try {
        const allStudents = await getAllStudents();
        const aggregatedPayments: AggregatedPaymentRecord[] = [];

        allStudents.forEach(student => {
          if (student.paymentHistory && student.paymentHistory.length > 0) {
            student.paymentHistory.forEach(payment => {
              aggregatedPayments.push({
                ...payment,
                studentId: student.studentId,
                studentName: student.name,
              });
            });
          }
        });

        aggregatedPayments.sort((a, b) => {
          try {
            const dateA = a.date && isValid(parseISO(a.date)) ? parseISO(a.date) : new Date(0);
            const dateB = b.date && isValid(parseISO(b.date)) ? parseISO(b.date) : new Date(0);
            return dateB.getTime() - dateA.getTime();
          } catch (e) { return 0; }
        });

        setAllPayments(aggregatedPayments);
      } catch (error) {
        console.error("Failed to fetch payment history:", error);
        toast({ title: "Error", description: "Could not load payment history.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    fetchPaymentHistory();
  }, [toast]);

  return (
    <>
      <PageTitle title="Recent Payment History" description="View a log of recent fee payments made by students." />

      <Card className="shadow-lg w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ListChecks className="mr-2 h-5 w-5 text-primary" />
            All Payments ({allPayments.length})
          </CardTitle>
          <CardDescription>Displaying all recorded transactions, sorted by most recent.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Loading payment history...</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {allPayments.length === 0 ? (
                  <div className="text-center text-muted-foreground py-6">
                     <History className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
                    No payment history found.
                  </div>
                ) : (
                  allPayments.map((payment) => (
                    <PaymentHistoryCardItem key={payment.paymentId} payment={payment} />
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Payment ID</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Method</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPayments.map((payment) => (
                      <TableRow key={payment.paymentId}>
                        <TableCell>{payment.paymentId}</TableCell>
                        <TableCell className="font-medium">{payment.studentName} ({payment.studentId})</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {payment.date && isValid(parseISO(payment.date))
                            ? format(parseISO(payment.date), 'MMM d, yyyy')
                            : 'N/A'}
                        </TableCell>
                        <TableCell>{payment.amount}</TableCell>
                        <TableCell>{payment.transactionId}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="capitalize">
                            <CreditCard className="mr-1 h-3 w-3"/>
                            {payment.method}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                    {allPayments.length === 0 && !isLoading && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                          <History className="mx-auto mb-2 h-10 w-10 text-muted-foreground" />
                          No payment history found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
}
