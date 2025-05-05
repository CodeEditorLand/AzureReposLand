/*---------------------------------------------------------------------------------------------
*  Copyright (c) Microsoft Corporation. All rights reserved.
*  Licensed under the MIT License. See License.txt in the project root for license information.
*--------------------------------------------------------------------------------------------*/
"use strict";

import { assert } from "chai";

import { Mocks } from "../helpers-integration/mocks";
import { TestSettings } from "../helpers-integration/testsettings";

import { CredentialManager } from "../../src/helpers/credentialmanager";
import { CredentialInfo } from "../../src/info/credentialinfo";
import { TeamServerContext } from "../../src/contexts/servercontext";
import { Constants } from "../../src/helpers/constants";

describe("CredentialManager-Integration", function() {
    this.timeout(TestSettings.SuiteTimeout); //http://mochajs.org/#timeouts

    const credentialManager: CredentialManager = new CredentialManager();
    const ctx: TeamServerContext = Mocks.TeamServerContext(TestSettings.RemoteRepositoryUrl);

    before(function() {
        //
    });
    beforeEach(function() {
        //
    });
    //afterEach(function() { });
    after(function() {
        //Ensure we're clean after each test (even if one failed)
        return credentialManager.RemoveCredentials(ctx);
    });

    it("should verify store, get, remove credentials for Azure DevOps Services (no token in settings)", async function() {
        try {
            await credentialManager.StoreCredentials(ctx, TestSettings.AccountUser, TestSettings.Password);
            let credInfo: CredentialInfo = await credentialManager.GetCredentials(ctx);
            //For PATs, username stored with StoreCredentials doesn't matter (it's always returned as OAuth)
            assert.equal(credInfo.Username, Constants.OAuth);
            assert.equal(credInfo.Password, TestSettings.Password);
            await credentialManager.RemoveCredentials(ctx);
            credInfo = await credentialManager.GetCredentials(ctx);
            //Ensure the creds we added get removed
            assert.isUndefined(credInfo);
        } catch (err) {
            console.log(err);
        }
    });

    it("should verify store, get, remove credentials for Team Foundation Server", async function() {
        try {
            const ctx: TeamServerContext = Mocks.TeamServerContext("http://java-tfs2015:8081/tfs/DefaultCollection/_git/GitJava");
            //const account: string = "java-tfs2015:8081";
            const username: string = "domain\\user";
            const password: string = "password";

            await credentialManager.StoreCredentials(ctx, username, password);
            let credInfo: CredentialInfo = await credentialManager.GetCredentials(ctx);
            assert.equal(credInfo.Domain, "domain");
            assert.equal(credInfo.Username, "user");
            assert.equal(credInfo.Password, password);
            await credentialManager.RemoveCredentials(ctx);
            credInfo = await credentialManager.GetCredentials(ctx);
            //Ensure the creds we added get removed
            assert.isUndefined(credInfo);
        } catch (err) {
            console.log(err);
        }
    });

    it("should verify azure accounts use both host + account", async function() {
        try {
            const ctxAccount1: TeamServerContext = Mocks.TeamServerContext("http://mytest.azure.com/account1/_git/GitJava");
            const ctxAccount2: TeamServerContext = Mocks.TeamServerContext("http://mytest.azure.com/account2/_git/GitJava");
            await credentialManager.StoreCredentials(ctxAccount1, TestSettings.AccountUser, TestSettings.Password);

            //ensure account1 has credentials
            let credInfo: CredentialInfo = await credentialManager.GetCredentials(ctxAccount1);
            //For PATs, username stored with StoreCredentials doesn't matter (it's always returned as OAuth)
            assert.equal(credInfo.Username, Constants.OAuth);
            assert.equal(credInfo.Password, TestSettings.Password);

            //Ensure account2 does not use the credentials of account1
            credInfo = await credentialManager.GetCredentials(ctxAccount2);
            assert.isUndefined(credInfo);

            //Cleanup
            await credentialManager.RemoveCredentials(ctxAccount1);
            credInfo = await credentialManager.GetCredentials(ctxAccount1);
            //Ensure the creds we added get removed
            assert.isUndefined(credInfo);
        } catch (err) {
            console.log(err);
        }
    });

    it("should verify visualstudio accounts only use host", async function() {
        try {
            const ctxAccount1: TeamServerContext = Mocks.TeamServerContext("http://account.visualstudio.com/DefaultCollection/_git/GitJava");
            const ctxAccount2: TeamServerContext = Mocks.TeamServerContext("http://account.visualstudio.com/DefaultCollection/_git/GitJava");
            await credentialManager.StoreCredentials(ctxAccount1, TestSettings.AccountUser, TestSettings.Password);

            //ensure account1 has credentials
            let credInfo: CredentialInfo = await credentialManager.GetCredentials(ctxAccount1);
            //For PATs, username stored with StoreCredentials doesn't matter (it's always returned as OAuth)
            assert.equal(credInfo.Username, Constants.OAuth);
            assert.equal(credInfo.Password, TestSettings.Password);

            //Ensure account2 does use the credentials of account1
            credInfo = await credentialManager.GetCredentials(ctxAccount2);
            assert.equal(credInfo.Username, Constants.OAuth);
            assert.equal(credInfo.Password, TestSettings.Password);

            //Cleanup
            await credentialManager.RemoveCredentials(ctxAccount1);
            credInfo = await credentialManager.GetCredentials(ctxAccount1);
            //Ensure the creds we added get removed
            assert.isUndefined(credInfo);
        } catch (err) {
            console.log(err);
        }
    });

});
