/*
 * Copyright 2020 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

export interface Config {
  /** Optional configurations for the Kubecost plugin */
  kubecost?: {
    /**
     * The base url of the Kubecost instance.
     * @visibility frontend
     */
    baseUrl: string;
    /**
     * Namespaces which will share their costs to deployments (Optional).
     * @visibility frontend
     */
    sharedNamespaces: string;
    /**
     * Timeframes to select (Optional).
     * @visibility frontend
     */
    queryframes: string;
    /**
     * Currency Prefix (Optional).
     * @visibility frontend
     */
    unitprefix: string;
    /**
     * Fraction digits (Optional).
     * @visibility frontend
     */
    fractionDigits: number;
    /**
     * The name of the annotation that contains the deployment name  (Optional)
     * @visibility frontend
     */
    annotationDeploymentName: string;
    /**
     * Share the cost of cluster overhead assets such as cluster management costs and node attached volumes across tenants of those resources  (Optional)
     * @visibility frontend
     */
    shareTenancyCosts: boolean;
    /**
     * To aggregate the data by controller.  (Optional)
     * @visibility frontend
     */
    aggregate: boolean;
    /**
     * Shows the Kubecost dashboard link in the Plugin information section.  (Optional)
     * @visibility frontend
     */
    showDashboardLink: boolean;
  };
}
