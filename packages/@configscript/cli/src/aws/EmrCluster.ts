import {Resource} from '../Resource'

export interface EmrClusterArguments {
  additional_info?: string
  applications?: Set<string>
  autoscaling_role?: string
  configurations?: string
  configurations_json?: string
  core_instance_count?: number
  core_instance_type?: string
  custom_ami_id?: string
  ebs_root_volume_size?: number
  id?: string
  keep_job_flow_alive_when_no_steps?: boolean
  log_uri?: string
  master_instance_type?: string
  name: string
  release_label: string
  scale_down_behavior?: string
  security_configuration?: string
  service_role: string
  step?: Array<{
    action_on_failure: string
    hadoop_jar_step: Array<{args: Array<string>; jar: string; main_class: string; properties: {[key: string]: string}}>
    name: string
  }>
  tags?: {[key: string]: string}
  termination_protection?: boolean
  visible_to_all_users?: boolean
}

export interface EmrClusterAttributes {
  additional_info?: string
  applications?: Set<string>
  autoscaling_role?: string
  cluster_state: string
  configurations?: string
  configurations_json?: string
  core_instance_count: number
  core_instance_type: string
  custom_ami_id?: string
  ebs_root_volume_size?: number
  id: string
  keep_job_flow_alive_when_no_steps: boolean
  log_uri?: string
  master_instance_type: string
  master_public_dns: string
  name: string
  release_label: string
  scale_down_behavior: string
  security_configuration?: string
  service_role: string
  step: Array<{
    action_on_failure: string
    hadoop_jar_step: Array<{args: Array<string>; jar: string; main_class: string; properties: {[key: string]: string}}>
    name: string
  }>
  tags?: {[key: string]: string}
  termination_protection: boolean
  visible_to_all_users?: boolean
}

export class EmrCluster extends Resource<EmrClusterArguments, EmrClusterAttributes> {
  _kind = 'aws_emr_cluster'

  get additional_info() {
    return this._attr('additional_info')
  }

  get applications() {
    return this._attr('applications')
  }

  get autoscaling_role() {
    return this._attr('autoscaling_role')
  }

  get cluster_state() {
    return this._attr('cluster_state')
  }

  get configurations() {
    return this._attr('configurations')
  }

  get configurations_json() {
    return this._attr('configurations_json')
  }

  get core_instance_count() {
    return this._attr('core_instance_count')
  }

  get core_instance_type() {
    return this._attr('core_instance_type')
  }

  get custom_ami_id() {
    return this._attr('custom_ami_id')
  }

  get ebs_root_volume_size() {
    return this._attr('ebs_root_volume_size')
  }

  get id() {
    return this._attr('id')
  }

  get keep_job_flow_alive_when_no_steps() {
    return this._attr('keep_job_flow_alive_when_no_steps')
  }

  get log_uri() {
    return this._attr('log_uri')
  }

  get master_instance_type() {
    return this._attr('master_instance_type')
  }

  get master_public_dns() {
    return this._attr('master_public_dns')
  }

  get name() {
    return this._attr('name')
  }

  get release_label() {
    return this._attr('release_label')
  }

  get scale_down_behavior() {
    return this._attr('scale_down_behavior')
  }

  get security_configuration() {
    return this._attr('security_configuration')
  }

  get service_role() {
    return this._attr('service_role')
  }

  get step() {
    return this._attr('step')
  }

  get tags() {
    return this._attr('tags')
  }

  get termination_protection() {
    return this._attr('termination_protection')
  }

  get visible_to_all_users() {
    return this._attr('visible_to_all_users')
  }
}