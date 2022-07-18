import mixpanel from "mixpanel-browser";

export const audit = (action, user) => {
	mixpanel.identify("user", user.email);
	mixpanel.people.set(user);
	mixpanel.track(action, user);
};
