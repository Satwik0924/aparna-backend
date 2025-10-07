import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../utils/database';

// Define the attributes interface
interface SellDoLeadAttributes {
  id: string;
  clientId: string;
  
  // Form Data
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber: string;
  age?: number;
  pinCode?: string; 
  propertyType: string;
  project?: string;
  budget?: string;
  timeFrame?: string;
  sellDoProjectId?: string;
  resumeUrl?: string;
  srd?: string; // SRD field
  
  // UTM Parameters
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  utmNetwork?: string;
  utmDevice?: string;
  unitType?: string;
  message?: string;
  
  // SellDo Response
  sellDoResponse?: any;
  sellDoStatus: 'success' | 'failed';
  
  // Metadata
  sourceUrl?: string;
  ipAddress?: string;
  
  createdAt: Date;
  updatedAt: Date;
}

// Define creation attributes (optional fields for creation)
interface SellDoLeadCreationAttributes extends Optional<SellDoLeadAttributes, 
  'id' | 'lastName' | 'age' | 'pinCode' | 'project' | 'budget' | 'timeFrame' | 'sellDoProjectId' | 'srd' | 'unitType' | 'message' | 'resumeUrl' | 'utmSource' | 'utmMedium' | 'utmCampaign' | 'utmTerm' | 'utmContent' | 'utmNetwork' | 'utmDevice' | 'sellDoResponse' | 'sourceUrl' | 'ipAddress' | 'createdAt' | 'updatedAt'> {}

// Define the model class
class SellDoLead extends Model<SellDoLeadAttributes, SellDoLeadCreationAttributes> implements SellDoLeadAttributes {
  public id!: string;
  public clientId!: string;
  
  public firstName!: string;
  public lastName?: string;
  public email!: string;
  public phoneNumber!: string;
  public age?: number; 
  public pinCode?: string;
  public propertyType!: string;
  public project?: string;
  public budget?: string;
  public timeFrame?: string;
  public sellDoProjectId?: string;
  public srd?: string; 
  public resumeUrl?: string | undefined;
  
  // UTM Parameters
  public utmSource?: string;
  public utmMedium?: string;
  public utmCampaign?: string;
  public utmTerm?: string;
  public utmContent?: string;
  public utmNetwork?: string;
  public utmDevice?: string;
  
  public unitType?: string | undefined;
  public message?: string | undefined;
  public sellDoResponse?: any;
  public sellDoStatus!: 'success' | 'failed';
  
  public sourceUrl?: string;
  public ipAddress?: string;
  
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize the model
SellDoLead.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    clientId: {
      type: DataTypes.STRING,
      allowNull: false,
      field: 'client_id'
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'first_name'
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'last_name'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    resumeUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'resume_url'
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: false,
      field: 'phone_number'
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: 'age'
    },
    pinCode: {
      type: DataTypes.STRING(10),
      allowNull: true,
      field: 'pin_code'
    },
    propertyType: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'property_type'
    },
    project: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    unitType: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'unit_type'
    },
    budget: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    timeFrame: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'time_frame'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'message'
    },
    sellDoProjectId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      field: 'selldo_project_id'
    },
    srd: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'srd'
    },
    
    // UTM Fields
    utmSource: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'utm_source'
    },
    utmMedium: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'utm_medium'
    },
    utmCampaign: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'utm_campaign'
    },
    utmTerm: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'utm_term'
    },
    utmContent: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'utm_content'
    },
    utmNetwork: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'utm_network'
    },
    utmDevice: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'utm_device'
    },
    
    sellDoResponse: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'selldo_response',
      get() {
        const value = this.getDataValue('sellDoResponse');
        return value ? JSON.parse(value) : null;
      },
      set(value: any) {
        this.setDataValue('sellDoResponse', value ? JSON.stringify(value) : null);
      }
    },
    sellDoStatus: {
      type: DataTypes.ENUM('success', 'failed'),
      allowNull: false,
      defaultValue: 'failed',
      field: 'selldo_status'
    },
    sourceUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: 'source_url'
    },
    ipAddress: {
      type: DataTypes.STRING(45),
      allowNull: true,
      field: 'ip_address'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'created_at'
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'updated_at'
    }
  },
  {
    sequelize,
    tableName: 'selldo_leads',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['client_id']
      },
      {
        fields: ['email']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['selldo_status']
      },
      {
        fields: ['selldo_project_id']
      },
      {
        fields: ['srd'] // Index for SRD queries
      },
      // UTM indexes for better query performance
      {
        fields: ['utm_source']
      },
      {
        fields: ['utm_medium']
      },
      {
        fields: ['utm_campaign']
      }
    ]
  }
);

export default SellDoLead;