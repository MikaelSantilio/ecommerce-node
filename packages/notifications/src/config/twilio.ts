import twilio from 'twilio';

export const createTwilioClient = () => {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn('⚠️  Twilio credentials not provided. SMS functionality will be limited.');
    return null;
  }

  return twilio(accountSid, authToken);
};

export const twilioClient = createTwilioClient();

export const getTwilioPhoneNumber = (): string => {
  return process.env.TWILIO_PHONE_NUMBER || '';
};
