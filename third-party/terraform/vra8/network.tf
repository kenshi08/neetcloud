#Create Network Profile
data "vra_cloud_account_aws" "this" {
  name = var.aws_cloud_account
  depends_on = [vra_project.this]
}

data "vra_region" "this" {
  cloud_account_id = data.vra_cloud_account_aws.this.id
  region           = var.region
}

data "vra_fabric_network" "subnet_1" {
  filter = "name eq '${var.subnet_name}'"
  depends_on = [vra_project.this]
}

resource "vra_network_profile" "simple" {
  depends_on = [vra_project.this]
  name        = var.network_profile_name
  description = "Simple Network Profile using Terraform"
  region_id   = data.vra_region.this.id

  fabric_network_ids = [
    data.vra_fabric_network.subnet_1.id
  ]

  isolation_type = "NONE"

  tags {
    key   = "function"
    value = "web"
  }
}