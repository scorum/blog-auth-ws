const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema(
  {
    email: { type: String, default: '' },
    username: { type: String, default: '' },
    pub_key: { type: String, default: '' },
    phone: { type: String, default: '', index: true },
    resend_counter: { type: Number, default: 0 },
    resend_at: { type: Date, default: Date.now },
    change_phone_counter: { type: Number, default: 0 },
    phone_changed_at: { type: Date, default: Date.now },
    verify_code: { type: String, default: '' },
    access_token: { type: String, sparse: true },
    reg_token: { type: String, sparse: true },
    registered_at: { type: Date, default: '' },
    phone_verified: { type: Boolean, default: false },
    reg_flow: { type: String, default: '' },
    domain: { type: String, default: '' },
    project: { type: String, default: '' },
    click_id: { type: String, default: '' },
    traffic_id: { type: String, default: '' },
    spent_eth: { type: Number, default: 0 }
  },
  {
    timestamps: {
      updatedAt: 'updated_at',
      createdAt: 'created_at'
    }
  }
);

module.exports = mongoose.model('Account', accountSchema);
