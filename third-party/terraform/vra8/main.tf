provider vra {
  url           = var.vra_url
  refresh_token = var.vra_refresh_token
}

# Set up the AWS Cloud Account
resource "vra_cloud_account_aws" "this" {
  name        = var.aws_cloud_account
  description = "AWS Cloud Account configured by Terraform"
  access_key  = var.aws_access_key
  secret_key  = var.aws_secret_key
  regions     = [var.region]

  tags {
    key   = "platform"
    value = "aws"
  }
}

data "vra_region" "region_aws_west" {
  cloud_account_id = vra_cloud_account_aws.this.id
  region           = var.region
}

# Configure a new Cloud Zone
resource "vra_zone" "zone_aws_west" {
  depends_on = [vra_cloud_account_aws.this]
  name        = var.aws_cloud_zone
  description = "Cloud Zone configured by Terraform"
  region_id   = data.vra_region.region_aws_west.id

  tags {
    key   = "platform"
    value = "aws"
  }

  tags {
    key   = "region"
    value = "california"
  }
}

# Create flavor profile
resource "vra_flavor_profile" "flavor_west" {
  depends_on = [vra_cloud_account_aws.this,vra_zone.zone_aws_west]
  name        = "terraform-flavour-profile-1"
  description = "Flavour profile created by Terraform"
  region_id   = data.vra_region.region_aws_west.id

  flavor_mapping {
    name          = "x-small"
    instance_type = "t2.micro"
  }

  flavor_mapping {
    name          = "small"
    instance_type = "t2.small"
  }

  flavor_mapping {
    name          = "medium"
    instance_type = "t2.medium"
  }
  
  flavor_mapping {
    name          = "large"
    instance_type = "t2.large"
  }
}

# Create a new image profile
resource "vra_image_profile" "image_west" {
  depends_on = [vra_cloud_account_aws.this,vra_zone.zone_aws_west]
  name        = "terraform-aws-image-profile-1"
  description = "AWS image profile created by Terraform"
  region_id   = data.vra_region.region_aws_west.id

  image_mapping {
    name       = "ubuntu-bionic"
    image_name = "ami-0dd655843c87b6930"
  }
}

# Create a new Project
resource "vra_project" "this" {
  provisioner "local-exec" {
      command = "sleep 30"
  }
  depends_on = [vra_cloud_account_aws.this,vra_zone.zone_aws_west]
  name        = var.vra_project_name
  description = "Project configured by Terraform"

  administrators = ["clementwong@vmware.com"]

  zone_assignments {
    zone_id       = vra_zone.zone_aws_west.id
    priority      = 1
    max_instances = 0
  }
}

output "project_id" {
  value = "${vra_project.this.id}"
}