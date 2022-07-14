import mixpanel from "mixpanel-browser";

mixpanel.init("1808e36e2fdfd13139a1df86c970aa1b", { debug: true });

export const audit = (action, user) => {
	mixpanel.identify(user.email);
	mixpanel.people.set(user);
	mixpanel.track(action, user);
};
