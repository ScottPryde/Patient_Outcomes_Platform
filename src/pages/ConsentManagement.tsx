import { useState } from "react";
import { useConsent } from "../contexts/ConsentContext";
import { useAuth } from "../contexts/AuthContext";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner@2.0.3";
import { formatDistanceToNow } from "date-fns";

export function ConsentManagement() {
  const {
    consents,
    userConsents,
    acceptConsent,
    declineConsent,
    withdrawConsent,
  } = useConsent();
  const { user, activePatient } = useAuth();
  const [selectedConsent, setSelectedConsent] = useState<
    string | null
  >(null);
  const [showWithdrawDialog, setShowWithdrawDialog] =
    useState(false);
  const [withdrawReason, setWithdrawReason] = useState("");

  if (!user) return null;

  const userId =
    user.role === "caregiver" && activePatient
      ? activePatient.id
      : user.id;

  const getConsentStatus = (consentId: string) => {
    const userConsent = userConsents.find(
      (uc) =>
        uc.userId === userId && uc.consentId === consentId,
    );
    return userConsent?.status || "pending";
  };

  const getUserConsent = (consentId: string) => {
    return userConsents.find(
      (uc) =>
        uc.userId === userId && uc.consentId === consentId,
    );
  };

  const handleAccept = async (consentId: string) => {
    try {
      await acceptConsent(
        consentId,
        user.role === "caregiver" && activePatient
          ? activePatient.id
          : undefined,
      );
      toast.success("Consent accepted successfully");
    } catch (error) {
      toast.error("Failed to accept consent");
    }
  };

  const handleDecline = async (consentId: string) => {
    try {
      await declineConsent(
        consentId,
        user.role === "caregiver" && activePatient
          ? activePatient.id
          : undefined,
      );
      toast.success("Consent declined");
    } catch (error) {
      toast.error("Failed to decline consent");
    }
  };

  const handleWithdraw = async () => {
    if (!selectedConsent) return;

    const userConsent = getUserConsent(selectedConsent);
    if (!userConsent) return;

    try {
      await withdrawConsent(userConsent.id, withdrawReason);
      toast.success("Consent withdrawn successfully");
      setShowWithdrawDialog(false);
      setWithdrawReason("");
      setSelectedConsent(null);
    } catch (error) {
      toast.error("Failed to withdraw consent");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <CheckCircle className="w-6 h-6 text-green-500" />
        );
      case "declined":
        return <XCircle className="w-6 h-6 text-red-500" />;
      case "withdrawn":
        return <XCircle className="w-6 h-6 text-orange-500" />;
      default:
        return <Clock className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "declined":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "withdrawn":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300";
      default:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300";
    }
  };

  const requiredConsents = consents.filter((c) => c.required);
  const optionalConsents = consents.filter((c) => !c.required);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-gray-900 dark:text-white mb-2">
          Consent Management
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {user.role === "caregiver" && activePatient
            ? `Managing consents for ${activePatient.firstName} ${activePatient.lastName}`
            : "Review and manage your consent preferences"}
        </p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Shield className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900 dark:text-blue-200">
              Understanding Consent
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
              Consent forms are legal documents that explain how
              your health information will be used. You can
              accept, decline, or withdraw consent at any time.
              Some consents are required to use platform
              features.
            </p>
          </div>
        </div>
      </div>

      {/* Required Consents */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-semibold">Required Consents</h2>
          <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300 text-xs rounded">
            Required
          </span>
        </div>

        <div className="space-y-4">
          {requiredConsents.map((consent) => {
            const status = getConsentStatus(consent.id);
            const userConsent = getUserConsent(consent.id);

            return (
              <div
                key={consent.id}
                className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(status)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">
                          {consent.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {consent.description}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(status)}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="text-sm text-gray-500 mb-4">
                      Version {consent.version} • Updated{" "}
                      {formatDistanceToNow(
                        new Date(consent.updatedAt),
                        { addSuffix: true },
                      )}
                    </div>

                    {userConsent &&
                      userConsent.actingUserId && (
                        <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg text-sm">
                          <AlertCircle className="w-4 h-4 inline mr-2 text-purple-600" />
                          Accepted by caregiver on behalf of
                          patient
                        </div>
                      )}

                    <details className="mb-4">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View Full Consent
                      </summary>
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm prose dark:prose-invert max-w-none">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: consent.content.replace(
                              /\n/g,
                              "<br />",
                            ),
                          }}
                        />
                      </div>
                    </details>

                    <div className="flex gap-3">
                      {status === "pending" ||
                      status === "declined" ? (
                        <>
                          <button
                            onClick={() =>
                              handleAccept(consent.id)
                            }
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() =>
                              handleDecline(consent.id)
                            }
                            className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            Decline
                          </button>
                        </>
                      ) : status === "accepted" ? (
                        <button
                          onClick={() => {
                            setSelectedConsent(consent.id);
                            setShowWithdrawDialog(true);
                          }}
                          className="px-6 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          Withdraw Consent
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Optional Consents */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <h2 className="font-semibold">Optional Consents</h2>
          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs rounded">
            Optional
          </span>
        </div>

        <div className="space-y-4">
          {optionalConsents.map((consent) => {
            const status = getConsentStatus(consent.id);
            const userConsent = getUserConsent(consent.id);

            return (
              <div
                key={consent.id}
                className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {getStatusIcon(status)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold">
                          {consent.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {consent.description}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(status)}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="text-sm text-gray-500 mb-4">
                      Version {consent.version}
                    </div>

                    <details className="mb-4">
                      <summary className="cursor-pointer text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View Full Consent
                      </summary>
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg text-sm prose dark:prose-invert max-w-none">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: consent.content.replace(
                              /\n/g,
                              "<br />",
                            ),
                          }}
                        />
                      </div>
                    </details>

                    <div className="flex gap-3">
                      {status === "pending" ||
                      status === "declined" ? (
                        <>
                          <button
                            onClick={() =>
                              handleAccept(consent.id)
                            }
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                          >
                            Accept
                          </button>
                          {status === "pending" && (
                            <button
                              onClick={() =>
                                handleDecline(consent.id)
                              }
                              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                              Decline
                            </button>
                          )}
                        </>
                      ) : status === "accepted" ? (
                        <button
                          onClick={() => {
                            setSelectedConsent(consent.id);
                            setShowWithdrawDialog(true);
                          }}
                          className="px-6 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          Withdraw Consent
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Withdraw dialog */}
      {showWithdrawDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
            <h3 className="font-semibold mb-4">
              Withdraw Consent
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to withdraw this consent?
              This may limit access to certain platform
              features.
            </p>

            <label className="block text-sm font-medium mb-2">
              Reason for withdrawal (optional)
            </label>
            <textarea
              value={withdrawReason}
              onChange={(e) =>
                setWithdrawReason(e.target.value)
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 mb-4"
              placeholder="Please explain why you're withdrawing consent..."
            />

            <div className="flex gap-3">
              <button
                onClick={handleWithdraw}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
              >
                Confirm Withdrawal
              </button>
              <button
                onClick={() => {
                  setShowWithdrawDialog(false);
                  setWithdrawReason("");
                  setSelectedConsent(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}