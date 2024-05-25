export class UserInfo {
	private _id: string;
	private _providerDisplayName: string;
	private _customDisplayName: string;

	constructor(
		id: string,
		providerDisplayName: string,
		customDisplayName: string,
	) {
		this._id = id;
		this._providerDisplayName = providerDisplayName;
		this._customDisplayName = customDisplayName;
	}

	public get Id(): string {
		return this._id;
	}
	public get ProviderDisplayName(): string {
		return this._providerDisplayName;
	}
	public get CustomDisplayName(): string {
		return this._customDisplayName;
	}
}
