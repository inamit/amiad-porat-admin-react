import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { HttpsError } from 'firebase-functions/lib/providers/https';
import { DocumentSnapshot } from 'firebase-functions/v1/firestore';

admin.initializeApp();

enum UserRole {
  STUDENT = 1,
  TUTOR = 2,
  TEACHER = 3,
  ADMIN = 4
}

const isUserRoleAbove = async (uid: string, requestedRole: UserRole) => {
  const user = await admin.firestore().collection('users').doc(uid).get();

  const role = user.get('role');

  return user.exists && role ? role >= requestedRole : false;
};

export const createUser = functions.https.onCall(async (data, context) => {
  if (context.app == undefined) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'The function must be called from an App Check verified app.'
    );
  }

  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User cannot access this information'
    );
  }

  if (!isUserRoleAbove(context.auth.uid, UserRole.ADMIN)) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'User cannot access this information'
    );
  }

  try {
    const { uid } = await admin.auth().createUser({
      email: data.email,
      password: data.password
    });

    functions.logger.info(
      `User with email ${data.email} created with uid: ${uid}`
    );
    functions.logger.debug(`Creating user ${uid} record in firestore`);

    const info = {
      firstName: data.firstName,
      lastName: data.lastName,
      birthDate: data.birthDate,
      phoneNo: data.phoneNo,
      ...(data.grade && { grade: data.grade }),
      ...(data.group && { group: data.group }),
      ...(data.subjects && { subjects: data.subjects }),
      role: data.role
    };

    await admin.firestore().collection('users').doc(uid).set(info);
  } catch (error) {
    switch ((error as any).code) {
      case 'auth/email-already-exists':
        throw new HttpsError('already-exists', 'המייל כבר קיים במערכת');
      default:
        functions.logger.error(
          `Unexpected error occured while creating new user.`,
          error
        );
        throw new HttpsError('internal', 'קרתה תקלה. פנה לתמיכה');
    }
  }
});

export const getAllUsers = functions.https.onCall(async (data, context) => {
  try {
    if (context.app == undefined) {
      throw new functions.https.HttpsError(
        'failed-precondition',
        'The function must be called from an App Check verified app.'
      );
    }

    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User cannot access this information'
      );
    }

    if (!isUserRoleAbove(context.auth.uid, UserRole.ADMIN)) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'User cannot access this information'
      );
    }

    const { users } = await admin.auth().listUsers();

    return await Promise.all(
      users.map(async ({ uid, email, metadata, customClaims, phoneNumber }) => {
        try {
          const userInfo: DocumentSnapshot = await admin
            .firestore()
            .collection('users')
            .doc(uid)
            .get();

          const response: any = {
            ...userInfo.data(),
            uid,
            email,
            metadata,
            customClaims,
            phoneNumber
          };

          return response;
        } catch (e) {
          functions.logger.error(e);
        }
      })
    );
  } catch (e) {
    functions.logger.error(e);
    console.log(e);
  }

  return [];
});
