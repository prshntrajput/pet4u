'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { paymentAPI } from '@/lib/api/payments';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function PaymentsPage() {
  const { user } = useAuth({ requireAuth: true });
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPayments();
    }
  }, [user]);

  const loadPayments = async () => {
    try {
      const response = user.role === 'shelter' 
        ? await paymentAPI.getShelterPayments()
        : await paymentAPI.getUserPayments();
      
      if (response.success) {
        setPayments(response.data.data.payments);
      }
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
        <p className="text-gray-600 mt-2">
          View all your {user.role === 'shelter' ? 'received' : ''} transactions
        </p>
      </div>

      {/* Payments List */}
      {payments.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <CreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No payments yet
            </h3>
            <p className="text-gray-600">
              Your payment history will appear here
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getStatusIcon(payment.status)}
                    </div>

                    {/* Payment Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-semibold text-gray-900">
                          {payment.paymentType === 'adoption_fee' 
                            ? 'Adoption Fee' 
                            : 'Donation'
                          }
                        </h3>
                        <Badge
                          variant={
                            payment.status === 'success' ? 'success' :
                            payment.status === 'failed' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {payment.status}
                        </Badge>
                      </div>

                      {payment.pet && (
                        <Link 
                          href={`/pets/${payment.pet.slug || payment.pet.id}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {payment.pet.name}
                        </Link>
                      )}

                      {payment.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {payment.description}
                        </p>
                      )}

                      {user.role === 'shelter' && payment.user && (
                        <p className="text-sm text-gray-600 mt-2">
                          From: {payment.user.name} ({payment.user.email})
                        </p>
                      )}

                      <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
                        <span>
                          {formatDistanceToNow(new Date(payment.createdAt), { addSuffix: true })}
                        </span>
                        {payment.razorpayPaymentId && (
                          <span>ID: {payment.razorpayPaymentId}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-gray-900">
                      ₹{payment.amount}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {payment.currency}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
