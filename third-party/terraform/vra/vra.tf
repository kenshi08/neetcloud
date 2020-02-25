provider "vra7" {
#--- Update terraform.tfvars for these details 
    username = "${var.username}"
    password = "${var.password}"
    host     = "${var.host}"
    tenant   = "${var.tenant}"
    insecure = true
}

resource "vra7_resource" "this" {
    catalog_name = "CentOS 6.3"

    catalog_configuration = {
        deployments = "1"
    }

	resource_configuration = {
        CentOS_6.3.cpu    = 1
        CentOS_6.3.memory = 1024
  }
  
}